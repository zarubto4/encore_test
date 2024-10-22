import { api } from "encore.dev/api";
import { JiraBugWeekHunterChecker } from "./reports/issueAllInValidator.service";
import {
  TransformationKindlyReminderUniversalRequest,
  TransformationKindlyReminderUniversalResponse,
  TransformationKindlyReminderValidatorRequest,
} from "./api_models/controllers.models";
import { IssueAllInHunterGenerator } from "./reports/issueAllInHunterGenerator.service";
import log from "encore.dev/log";

//  API ----------------------------------------------------------------------------------------------------------------

/**
 * Rung Generator of Kindly Reminder - Supporting every steps independently
 */
export const runGeneratorScript = api(
  { expose: true, auth: true, method: "POST", path: "/transformation/kindly_reminder/generator" },
  async (params: TransformationKindlyReminderUniversalRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
    try {
      log.info("Run generator script");
      new IssueAllInHunterGenerator()
        .runScript(params)
        .then(() => {
          // Dont Wait, dont do anything here
          log.info("Script is done");
        })
        .catch((error) => {
          console.error("We have error!!!!");
          console.error("We have error: " + error.message);
        });

      log.info("Run done - script is running");
      return { status: "script_is_running" };

      // @ts-expect-error @ts-ignore
    } catch (error: Error) {
      log.error("Script failed");
      console.error("We have error!!!!");
      console.log("We have error" + error.message);
      return { status: error.message ? error.message : "not defined Error" };
    }
  },
);

// Valid week from Kindly Reminder
export const runValidatorScript = api(
  { expose: true, auth: true, method: "POST", path: "/transformation/kindly_reminder/validator" },
  async (params: TransformationKindlyReminderValidatorRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
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
  },
);
