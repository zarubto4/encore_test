import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";
import moment from "moment";
import {transformation_kindly_reminder} from "~encore/clients";


export const cronValidWeek = api({expose: false}, async (): Promise<void> => {
    await transformation_kindly_reminder.run_validator_script (
        { value: moment().week() }
    );
});

new CronJob("transformation-kindlyReminder-weeklyChecker", {
    title: "Check Latest Week",
    every: "4h",
    endpoint: cronValidWeek,
});

