export interface GlobalDealFrameworkMessage {
  userId: string;
  connectionSessionId: string;
  messageId: string;
  message: {
    topic: string;
    content: unknown;
  };
}
