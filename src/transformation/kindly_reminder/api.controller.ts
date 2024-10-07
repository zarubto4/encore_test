import { api } from "encore.dev/api";
import { JiraBugWeekHunterChecker } from "./reports/issueAllInValidator.service";
import { TransformationKindlyReminderUniversalRequest, TransformationKindlyReminderUniversalResponse, TransformationKindlyReminderValidatorRequest } from "./api_models/controller_models";
import { IssueAllInHunterGenerator } from "./reports/issueAllInHunterGenerator.service";

//  API ----------------------------------------------------------------------------------------------------------------

// Rung Generator of Kindly Reminder - Supporting every steps independently
export const run_generator_script = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/generator" }, async (params: TransformationKindlyReminderUniversalRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
  try {
    new IssueAllInHunterGenerator()
      .runScript(params)
      .then(() => {
        // Dont Wait, dont do anything here
      })
      .catch((error) => {
        console.error("We have error!!!!");
        console.error("We have error: " + error.message);
      });

    return { status: "script_is_running" };

    // @ts-expect-error @ts-ignore
  } catch (error: Error) {
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
