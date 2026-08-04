import cron from "node-cron";
import Application from "../models/Application.js";

const getReminderMessage = (application, hoursLeft) => {
  if (hoursLeft <= 2) {
    return `Only ${hoursLeft.toFixed(1)} hours left to apply for ${application.company}.`;
  }

  if (hoursLeft <= 24) {
    return `The application deadline for ${application.company} is in ${Math.floor(hoursLeft)} hours.`;
  }

  return `The application deadline for ${application.company} is in ${Math.ceil(
    hoursLeft / 24
  )} day(s).`;
};

export const startReminderCron = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();

      const applications = await Application.find({
        status: "not_applied",
        deadline: { $gte: now },
      });

      for (const application of applications) {
        const hoursLeft =
          (application.deadline - now) / (1000 * 60 * 60);

        if (hoursLeft <= 24) {
          const message = getReminderMessage(application, hoursLeft);

          application.reminderLog.push({
            message,
            stage: hoursLeft <= 2 ? "urgent" : "normal",
          });

          await application.save();

          console.log(
            `Reminder sent for ${application.company}: ${message}`
          );
        }
      }

      // Update applications whose deadline has passed
      const expiredApplications = await Application.find({
        status: "not_applied",
        deadline: { $lt: now },
      });

      for (const application of expiredApplications) {
        application.status = "missed";
        await application.save();

        console.log(`${application.company} marked as missed.`);
      }
    } catch (error) {
      console.error("Error while checking reminders:", error.message);
    }
  });

  console.log("Reminder service started.");
};