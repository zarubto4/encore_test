import { api } from "encore.dev/api";
import log from "encore.dev/log";
import { TransformationKindlyReminderUniversalRequest, TransformationKindlyReminderUniversalResponse, TransformationKindlyReminderValidatorRequest } from "../kindly_reminder/api_models/controller_models";
import { JiraBugWeekHunterChecker } from "../kindly_reminder/reports/issueAllInValidator.service";

//  API ----------------------------------------------------------------------------------------------------------------

// Valid week from Kindly Reminder
export const runValidatorScript = api({ expose: true, method: "POST", path: "/transformation/big_picture/generator" }, async (params: TransformationKindlyReminderValidatorRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
  log.info("api::run_validator_script");
  new JiraBugWeekHunterChecker()
    .runScript(params)
    .then(() => {
      // Dont Wait, dont do anything here
    })
    .catch((error) => {
      console.error("We have error!!!!");
      console.error("We have error: " + error.message);
    });

  return { status: "script_is_running" };
});
