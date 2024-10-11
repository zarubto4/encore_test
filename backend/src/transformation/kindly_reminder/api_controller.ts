import { api } from "encore.dev/api";
import { JiraBugWeekHunterChecker } from "./reports/issueAllInValidator.service";
import { TransformationKindlyReminderUniversalRequest, TransformationKindlyReminderUniversalResponse, TransformationKindlyReminderValidatorRequest } from "./api_models/controller_models";
import { IssueAllInHunterGenerator } from "./reports/issueAllInHunterGenerator.service";
import log from "encore.dev/log";
import { DefaultResponse } from "../../system_1/service_1/hi";
import { DefaultRequest } from "../../system_1/service_1/hello";

//  API ----------------------------------------------------------------------------------------------------------------

/**
 * Hallo 3 test asdsa
 */
export const hello3 = api({ expose: true, method: "GET", path: "/dasdasdasdasdas/:name" }, async (params: DefaultRequest): Promise<DefaultResponse> => {
  const msg = `Hello ${params.name}! From service 3`;
  return { message: msg };
});

/**
 * Rung Generator of Kindly Reminder - Supporting every steps independently
 */
export const runGeneratorScript = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/generator" }, async (params: TransformationKindlyReminderUniversalRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
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
});

// Valid week from Kindly Reminder
export const runValidatorScript = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/validator" }, async (params: TransformationKindlyReminderValidatorRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
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
