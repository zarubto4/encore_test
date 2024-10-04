import { CronJob } from "encore.dev/cron";
import { api } from "encore.dev/api";

import {transformation_kindly_reminder, my_service_one} from "~encore/clients";




export const cronValidWeek = api({expose: false}, async (): Promise<void> => {
    await transformation_kindly_reminder.run_validator_script (
        { value: 40 }
    );
});


const _kindlyReminder_weeklyChecker = new CronJob("transformation-kindlyReminder-weeklyChecker", {
    title: "Check Latest Week",
    every: "4h",
    endpoint: cronValidWeek,
})

