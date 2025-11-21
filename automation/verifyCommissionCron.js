import { User } from "../models/userSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";
import { Commission } from "../models/commissionSchema.js";
import cron from "node-cron";
import { sendEmail } from "../utils/emailService.js";

export const processCommissionVerifications = async () => {
  console.log("Processing commission verifications...");
  try {
    const approvedProofs = await PaymentProof.find({ status: "Approved" });

    for (const proof of approvedProofs) {
      try {
        const user = await User.findById(proof.userId);
        if (!user) {
          console.error(`User not found for payment proof ${proof._id}`);
          continue;
        }

        let updatedUserData = {};

        if (user.unpaidCommission >= proof.amount) {
          updatedUserData = await User.findByIdAndUpdate(
            user._id,
            {
              $inc: {
                unpaidCommission: -proof.amount,
              },
            },
            { new: true }
          );
        } else {
          updatedUserData = await User.findByIdAndUpdate(
            user._id,
            {
              unpaidCommission: 0,
            },
            { new: true }
          );
        }

        await PaymentProof.findByIdAndUpdate(proof._id, {
          status: "Settled",
        });

        await Commission.create({
          amount: proof.amount,
          user: user._id,
        });

        const settlementDate = new Date().toLocaleDateString();
        const subject = `Payment Verification and Settlement Confirmation`;
        const message = `Dear ${user.userName},\n\nYour payment has been successfully verified and settled.\n\nPayment Details:\n- Amount Settled: Rs. ${proof.amount}\n- Remaining Unpaid Commission: Rs. ${updatedUserData.unpaidCommission}\n- Settlement Date: ${settlementDate}\n\nYou can now continue using our platform without restrictions.\n\nBest regards,\nZeeshu Auction Team`;

        await sendEmail({
          email: user.email,
          subject,
          message,
        });

        console.log(
          `Successfully processed payment proof ${proof._id} for user ${user._id}`
        );
      } catch (error) {
        console.error(`Error processing payment proof ${proof._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in verify commission cron:", error);
    throw error;
  }
};

export const verifyCommissionCron = () => {
  return cron.schedule("*/1 * * * *", async () => {
    try {
      await processCommissionVerifications();
    } catch (error) {
      console.error("Commission cron run failed:", error);
    }
  });
};
