export interface DefaultResponsesI {
  executed: "success";
}

export class DefaultResponses implements DefaultResponsesI {
  executed: "success";

  constructor() {
    this.executed = "success";
  }
}
