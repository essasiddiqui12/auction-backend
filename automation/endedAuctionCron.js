import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { sendWinnerEmail } from "../utils/emailService.js";
import { calculateCommission } from "../controllers/commissionController.js";

export const processEndedAuctions = async () => {
  const now = new Date();
  console.log("Processing ended auctions...");
  try {
    const endedAuctions = await Auction.find({
      endTime: { $lt: now },
      commissionCalculated: false,
    });

    for (const auction of endedAuctions) {
      try {
        const commissionAmount = await calculateCommission(auction._id);
        auction.commissionCalculated = true;

        const highestBid = auction.bids.sort((a, b) => b.amount - a.amount)[0];

        if (highestBid) {
          const bidder = await User.findById(highestBid.userId);
          const auctioneer = await User.findById(auction.createdBy);

          if (!bidder || !auctioneer) {
            console.error(`Missing bidder or auctioneer for auction ${auction._id}`);
            continue;
          }

          auction.highestBidder = bidder._id;
          auction.currentBid = highestBid.amount;
          await auction.save();

          await User.findByIdAndUpdate(
            bidder._id,
            {
              $inc: {
                moneySpent: highestBid.amount,
                auctionsWon: 1,
              },
            },
            { new: true }
          );

          await User.findByIdAndUpdate(
            auctioneer._id,
            {
              $inc: {
                unpaidCommission: commissionAmount,
              },
            },
            { new: true }
          );

          const winnerDetails = {
            userName: bidder.userName,
            email: bidder.email,
          };

          const auctionDetails = {
            title: auction.title,
            currentBid: highestBid.amount,
            endTime: auction.endTime,
          };

          await sendWinnerEmail(
            winnerDetails,
            auctionDetails,
            auctioneer.paymentMethods
          );

          console.log(`Winner notification sent for auction ${auction._id}`);
        }

        await auction.save();
      } catch (error) {
        console.error(`Error processing auction ${auction._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in ended auction cron:", error);
    throw error;
  }
};

export const endedAuctionCron = () => {
  return cron.schedule("*/1 * * * *", async () => {
    try {
      await processEndedAuctions();
    } catch (error) {
      console.error("Cron run failed:", error);
    }
  });
};
