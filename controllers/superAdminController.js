import mongoose from "mongoose";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Commission } from "../models/commissionSchema.js";
import { User } from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";
import { Bid } from "../models/bidSchema.js";

// Delete auction item
export const deleteAuctionItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id format.", 400));
  }
  const auctionItem = await Auction.findById(id);
  if (!auctionItem) {
    return next(new ErrorHandler("Auction not found.", 404));
  }
  await auctionItem.deleteOne();
  res.status(200).json({
    success: true,
    message: "Auction item deleted successfully.",
  });
});

// Get all payment proofs
export const getAllPaymentProofs = catchAsyncErrors(async (req, res, next) => {
  const paymentProofs = await PaymentProof.find().populate('userId', 'userName');
  res.status(200).json({
    success: true,
    paymentProofs,
  });
});

// Get payment proof detail
export const getPaymentProofDetail = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const paymentProofDetail = await PaymentProof.findById(id).populate('userId', 'userName');
  if (!paymentProofDetail) {
    return next(new ErrorHandler("Payment proof not found.", 404));
  }
  res.status(200).json({
    success: true,
    paymentProofDetail,
  });
});

// Update payment proof status
export const updateProofStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid ID format.", 400));
  }
  
  const proof = await PaymentProof.findById(id);
  if (!proof) {
    return next(new ErrorHandler("Payment proof not found.", 404));
  }
  
  proof.status = status;
  await proof.save();
  
  res.status(200).json({
    success: true,
    message: "Payment proof status updated successfully.",
    proof,
  });
});

// Delete payment proof
export const deletePaymentProof = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const proof = await PaymentProof.findById(id);
  if (!proof) {
    return next(new ErrorHandler("Payment proof not found.", 404));
  }
  await proof.deleteOne();
  res.status(200).json({
    success: true,
    message: "Payment proof deleted successfully.",
  });
});

// Get all users statistics
export const fetchAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        month: "$_id.month",
        year: "$_id.year",
        role: "$_id.role",
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { year: 1, month: 1 },
    },
  ]);

  const bidders = users.filter((user) => user.role === "Bidder");
  const auctioneers = users.filter((user) => user.role === "Auctioneer");

  const transformDataToMonthlyArray = (data, totalMonths = 12) => {
    const result = Array(totalMonths).fill(0);
    data.forEach((item) => {
      result[item.month - 1] = item.count;
    });
    return result;
  };

  const biddersArray = transformDataToMonthlyArray(bidders);
  const auctioneersArray = transformDataToMonthlyArray(auctioneers);

  res.status(200).json({
    success: true,
    biddersArray,
    auctioneersArray,
  });
});

// Get monthly revenue statistics
export const monthlyRevenue = catchAsyncErrors(async (req, res, next) => {
  const payments = await Commission.aggregate([
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  const transformDataToMonthlyArray = (payments, totalMonths = 12) => {
    const result = Array(totalMonths).fill(0);
    payments.forEach((payment) => {
      result[payment._id.month - 1] = payment.totalAmount;
    });
    return result;
  };

  const totalMonthlyRevenue = transformDataToMonthlyArray(payments);
  res.status(200).json({
    success: true,
    totalMonthlyRevenue,
  });
});

// Get active users count
export const getActiveUsers = catchAsyncErrors(async (req, res, next) => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const activeUsers = await User.countDocuments({
    lastActive: { $gte: fifteenMinutesAgo }
  });

  res.status(200).json({
    success: true,
    activeUsers
  });
});

// Get recent activities
export const getRecentActivities = catchAsyncErrors(async (req, res, next) => {
  const activities = [];
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Get recent bids
  const recentBids = await Bid.find({
    createdAt: { $gte: thirtyMinutesAgo }
  })
  .populate('userId', 'userName')
  .populate('auctionId', 'title')
  .sort('-createdAt')
  .limit(5);

  recentBids.forEach(bid => {
    activities.push({
      _id: bid._id,
      type: 'bid',
      message: `${bid.userId.userName} placed a bid of ₹${bid.amount} on "${bid.auctionId.title}"`,
      timestamp: bid.createdAt
    });
  });

  // Get recently ended auctions
  const recentEndedAuctions = await Auction.find({
    endTime: { $gte: thirtyMinutesAgo, $lte: new Date() }
  })
  .populate('highestBidder', 'userName')
  .sort('-endTime')
  .limit(5);

  recentEndedAuctions.forEach(auction => {
    activities.push({
      _id: auction._id,
      type: 'auction_end',
      message: `Auction "${auction.title}" ended${auction.highestBidder ? ` - Won by ${auction.highestBidder.userName}` : ' with no winner'}`,
      timestamp: auction.endTime
    });
  });

  // Get recent payment proofs
  const recentPayments = await PaymentProof.find({
    createdAt: { $gte: thirtyMinutesAgo }
  })
  .populate('userId', 'userName')
  .sort('-createdAt')
  .limit(5);

  recentPayments.forEach(payment => {
    activities.push({
      _id: payment._id,
      type: 'payment',
      message: `${payment.userId.userName} submitted a payment proof of ₹${payment.amount}`,
      timestamp: payment.createdAt
    });
  });

  // Sort all activities by timestamp
  activities.sort((a, b) => b.timestamp - a.timestamp);

  res.status(200).json({
    success: true,
    activities: activities.slice(0, 10) // Return only the 10 most recent activities
  });
});
