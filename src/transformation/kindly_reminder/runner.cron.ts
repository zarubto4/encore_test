import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import moment from "moment";
import { transformation_kindly_reminder } from "~encore/clients";

// --- Valid Week ------------------------------------------------------------------------------------------------------

export const cronValidWeek = api({ expose: false }, async (): Promise<void> => {
  await transformation_kindly_reminder.run_validator_script({ value: moment().week() });
});

new CronJob("transformation-kindlyReminder-weeklyChecker", {
  title: "Check Latest Week",
  every: "4h",
  endpoint: cronValidWeek,
});

// --- Close Asana task from last week ---------------------------------------------------------------------------------

export const closeAsanaTaskFromLastWEek = api({ expose: false }, async (): Promise<void> => {
  await transformation_kindly_reminder.run_generator_script({
    name: "close_asana_tickets",
    value: moment().week() - 1,
  });
});

new CronJob("transformation-kindlyReminder-closeAsanaPreviousWeek", {
  title: "Close all non closed asana Tickets from Kindly Reminder",
  schedule: "0 9 * * 1",
  endpoint: closeAsanaTaskFromLastWEek,
});
