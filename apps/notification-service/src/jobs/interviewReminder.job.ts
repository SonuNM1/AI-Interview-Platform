import cron from "node-cron";

export const startInterviewReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      // TODO:
      // Fetch interviews whose scheduledAt is
      // between 14 and 16 minutes from now
      //
      // Then send reminder email.
    } catch (error) {
      console.error(
        "Interview reminder job error:",
        error,
      );
    }
  });
};