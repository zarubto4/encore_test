import { api } from "encore.dev/api";
import log from "encore.dev/log";
import { ProductRoadmapService } from "./reports/product_roadmap/productRoadmap.service";
import { TransformationBigPictureUniversalRequest, TransformationBigPictureUniversalResponse } from "./models/api.models";
import { GlobalTempoInitiativesCapLaborOverview } from "./reports/jira_initiatives/jiraInitiativesTempoReport.service";

//  API ----------------------------------------------------------------------------------------------------------------

// Update Product RoadMap
export const createProductRoadmap = api(
  { expose: true, method: "POST", path: "/transformation/big_picture/generator" },
  async (params: TransformationBigPictureUniversalRequest): Promise<TransformationBigPictureUniversalResponse> => {
    log.info("api::run_validator_script");

    switch (params.name) {
      case "generate_product_roadmap": {
        new ProductRoadmapService()
          .runScript()
          .then(() => {
            // Dont Wait, dont do anything here
          })
          .catch((error) => {
            log.error(error);
            console.error("We have error!!!!");
            console.error("We have error: " + error.message);
          });
        break;
      }
      case "generate_product_week_statistics": {
        new GlobalTempoInitiativesCapLaborOverview()
          .runScript()
          .then(() => {
            // Dont Wait, dont do anything here
          })
          .catch((error) => {
            console.error("We have error!!!!");
            console.error("We have error: " + error.message);
          });
        break;
      }
    }

    return { status: "script_is_running" };
  },
);
