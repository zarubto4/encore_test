import { Header, Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import log from "encore.dev/log";
import { currentRequest } from "encore.dev";

// AuthParams specifies the incoming request information
// the auth handler is interested in. In this case it only
// cares about requests that contain the `Authorization` header.
interface AuthParams {
  authorization: Header<"Authorization">;
  bToken: Header<"bToken">;
}

// The AuthData specifies the information about the authenticated user
// that the auth handler makes available.
interface AuthDataGroupon {
  userID: string;
  my_session_mandatory_id: string;
}

// The auth handler itself.
export const auth = authHandler<AuthParams, AuthDataGroupon>(async (params) => {
  console.log("authHandler - params", params);

  console.log("authHandler - currentRequest:", currentRequest());

  if (params.authorization != "test") {
    throw APIError.unauthenticated("bad credentials. My description ");
  }

  return {
    userID: "my-user-id",
    my_session_mandatory_id: "aaa", // log.with({ advanceValue: "Yes!" }),
  };
});

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
  authHandler: auth,
});
