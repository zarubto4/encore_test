import {
  StreamLineDefaultHandshake,
  MessageConfirmation,
  StreamLineDefaultOutMessage,
  StreamLineDefaultInMessage,
  WelcomeMessage,
  StreamLineValidatedAndFilledHandshake,
} from "./models/request_models.models";
import { connectedStreams } from "./encore.service";
import {
  dealDraftCreation_dealDraftWs,
  userNotification_notificationsWs,
} from "../../globalDealFramework_services/dealDraftCreation/encore.service";
import { api, StreamInOut } from "encore.dev/api";
import { gatewayService_rbac } from "~encore/clients";
import log from "encore.dev/log";
