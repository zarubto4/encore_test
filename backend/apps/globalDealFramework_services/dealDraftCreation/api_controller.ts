import { Subscription } from "encore.dev/pubsub";
import log from "encore.dev/log";
import { dealDraftCreation_dealDraftWs } from "./encore.service";

new Subscription(dealDraftCreation_dealDraftWs, "dealDraftCreation_dealDraftWs_subscribeDCD", {
  handler: async (event) => {
    try {
      switch (event.topic) {
        case "test1": {
          break;
        }
      }

      console.log("Event ", event);
    } catch (error) {
      log.error("incoming Event error: error", error);
    }
  },
});
