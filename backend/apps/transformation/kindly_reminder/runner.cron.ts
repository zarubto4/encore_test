import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import moment from "moment";
import { transformation_kindly_reminder } from "~encore/clients";
import log from "encore.dev/log";

// --- Valid Week ------------------------------------------------------------------------------------------------------

export const cronValidWeek = api({ expose: false }, async (): Promise<void> => {
  await transformation_kindly_reminder
    .runValidatorScript({ value: moment().week() })
    .then(() => {
      log.info("cronValidWeek done");
    })
    .catch((error) => {
      log.error("cronValidWeek failed", error);
      log.error("cronValidWeek failed: message", error.message);
    });
});

new CronJob("transformation-kindlyReminder-weeklyChecker", {
  title: "Check Latest Week",
  every: "5m",
  endpoint: cronValidWeek,
});

// --- Close Asana task from last week ---------------------------------------------------------------------------------

export const cronCloseAsanaTaskFromLastWeek = api({ expose: false }, async (): Promise<void> => {
  await transformation_kindly_reminder
    .runGeneratorScript({
      name: "close_asana_tickets",
      week: moment().week() - 1,
    })
    .then(() => {
      log.info("cronCloseAsanaTaskFromLastWeek done");
    })
    .catch((error) => {
      log.error("cronCloseAsanaTaskFromLastWeek failed", error);
      log.error("cronCloseAsanaTaskFromLastWeek failed: message", error.message);
    });
});

new CronJob("transformation-kindlyReminder-closeAsanaPreviousWeek", {
  title: "Close all non closed asana Tickets from Kindly Reminder",
  schedule: "0 4 * * 1",
  endpoint: cronCloseAsanaTaskFromLastWeek,
});

// --- Generate next week -----------------------------------------------------------------------------------------------

export const generateNextWeekOfIssues = api({ expose: false }, async (): Promise<void> => {
  await transformation_kindly_reminder
    .runGeneratorScript({
      name: "run_whole_script",
      week: moment().week(),
    })
    .then(() => {
      log.info("generateNextWeekOfIssues done");
    })
    .catch((error) => {
      log.error("generateNextWeekOfIssues failed", error);
      log.error("generateNextWeekOfIssues failed: message", error.message);
    });
});

new CronJob("transformation-kindlyReminder-generateNextWeekOfIssues", {
  title: "Generate next week of issues in Kindly Reminder",
  schedule: "0 8 * * 1",
  endpoint: generateNextWeekOfIssues,
});
