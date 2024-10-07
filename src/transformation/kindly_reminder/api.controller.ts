import { api } from "encore.dev/api";
import { JiraBugWeekHunterChecker } from "./reports/issueAllInValidator.service";
import { TransformationKindlyReminderUniversalRequest, TransformationKindlyReminderUniversalResponse, TransformationKindlyReminderValidatorRequest } from "./api_models/controller_models";
import { IssueAllInHunterGenerator } from "./reports/issueAllInHunterGenerator.service";
import log, { Logger } from "encore.dev/log";
import { currentRequest } from "encore.dev";
import { getAuthData } from "~encore/internal/auth/auth";

//  API ----------------------------------------------------------------------------------------------------------------

export const testing = api({ expose: true, auth: true, method: "POST", path: "/transformation/kindly_reminder/testing" }, async (params: TransformationKindlyReminderUniversalRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
  // Printed: message: Test 1,
  log.trace("Test 1", params);
  log.trace("Test 1", currentRequest());

  console.log(currentRequest());
  console.log(currentRequest().trace.spanId);

  // Printed: message: Test 1, x=y
  log.trace("Test 2", getAuthData());

  const myLog = log.with({ my_session_mandatory_id: "aaa" });

  // Printed: message: Test 3, my_session_mandatory_id=aaa
  myLog.trace("Test 3");

  return { status: "script_is_running" };
});

// Rung Generator of Kindly Reminder - Supporting every steps independently
export const run_generator_script = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/generator" }, async (params: TransformationKindlyReminderUniversalRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
  try {
    const logger = log.with({ b_cookie: "tom" });
    logger.trace("test aseasda as ");

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
export const run_validator_script = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/validator" }, async (params: TransformationKindlyReminderValidatorRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
  new JiraBugWeekHunterChecker().runScript(params).then(() => {
    // Dont Wait, dont do anything here
  });

  return { status: "script_is_running" };
});
