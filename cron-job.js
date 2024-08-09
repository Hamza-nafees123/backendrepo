const cron = require('node-cron');
const User = require('./models/User');
const PaymentPlan = require('./models/paymentPlanModel');
const crypto = require('crypto');

// Cron job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();
    const users = await User.find({ planExpiryDate: { $lte: currentDate } });

    for (const user of users) {
      if (user.autoRenew && user.cardDetailsId) {
        const newPlan = await PaymentPlan.findById(user.paymentPlanId);

        if (newPlan) {
          const newPlanBookDownloads = newPlan.bookDownload || 0;
          const newPlanAudioBookDownloads = newPlan.audioBookDownload || 0;

          user.remainingDownloads = newPlanBookDownloads + newPlanAudioBookDownloads;

          // Reset plan expiry date
          const planDurationInMonths = newPlan.duration; // assuming duration is in months
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + planDurationInMonths);
          user.planExpiryDate = expiryDate;

          user.downloadToken = crypto.randomBytes(50).toString("hex");

          await user.save();
        }
      } else {
        // If auto-renew is not enabled, reset downloads
        user.remainingDownloads = 0;
        user.paymentPlanId = null;
        await user.save();
      }
    }
  } catch (error) {
    console.log("Error in auto-renewal job:", error);
  }
});
