import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { processEndedAuctions } from "../automation/endedAuctionCron.js";
import { processCommissionVerifications } from "../automation/verifyCommissionCron.js";

export const runEndedAuctions = catchAsyncErrors(async (req, res) => {
  await processEndedAuctions();
  res.status(200).json({
    success: true,
    message: "Ended auctions job executed successfully.",
  });
});

export const runCommissionVerification = catchAsyncErrors(async (req, res) => {
  await processCommissionVerifications();
  res.status(200).json({
    success: true,
    message: "Commission verification job executed successfully.",
  });
});

