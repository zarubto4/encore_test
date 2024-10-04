import { api } from "encore.dev/api";
import {JiraBugWeekHunterChecker} from "./reports/issueAllInValidator.service";
import {
    TransformationKindlyReminderUniversalRequest,
    TransformationKindlyReminderUniversalResponse,
    TransformationKindlyReminderValidatorRequest
} from "./api_models/controller_models";


//  API ----------------------------------------------------------------------------------------------------------------

// Rung Generator of Kindly Reminder - Supporting every steps independently
export const run_generator_script = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/generator" },
  async (params: TransformationKindlyReminderUniversalRequest): Promise<TransformationKindlyReminderUniversalResponse> => {

     //  new IssueAllInHunterGenerator().runScript(params).then((response) => {
     //      // Dont Wait
     //  });

      const color: string = "#fd8000";

      return { status: "script_is_running" };
  }
);

// Valid week from Kindly Reminder
export const run_validator_script = api({ expose: true, method: "POST", path: "/transformation/kindly_reminder/validator" },
    async (params: TransformationKindlyReminderValidatorRequest): Promise<TransformationKindlyReminderUniversalResponse> => {
        new JiraBugWeekHunterChecker().runScript(params).then((response) => {
            // Dont Wait
        });
        return { status: "script_is_running" };
    }
);

