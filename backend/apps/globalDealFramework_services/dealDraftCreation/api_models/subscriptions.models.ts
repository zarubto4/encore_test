export interface GlobalDealFrameworkMessage {
  user_id: string;
  connection_session_id: string;
  message_id: string;
  topic: string;
  message: unknown;
}
