import { sendWinnerEmail } from "../utils/emailService.js";

// ... existing code ...

// Inside the verifyEndedAuction function or wherever the auction end is handled
const verifyEndedAuction = async () => {
  try {
    const endedAuctions = await Auction.find({
      endTime: { $lte: new Date() },
      status: "Active"
    });

    for (const auction of endedAuctions) {
      if (auction.currentBidder) {
        // Get winner details
        const winner = await User.findById(auction.currentBidder);
        
        // Get auctioneer details for payment information
        const auctioneer = await User.findById(auction.auctioneer);

        // Send winner notification email
        await sendWinnerEmail(
          winner,
          auction,
          auctioneer.paymentMethods
        );

        // Update auction status
        auction.status = "Ended";
        await auction.save();
      }
    }
  } catch (error) {
    console.error("Error in verifyEndedAuction:", error);
  }
}; 