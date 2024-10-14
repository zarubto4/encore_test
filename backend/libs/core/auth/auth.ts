import { Header, Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

// AuthParams specifies the incoming request information
// the auth handler is interested in. In this case it only
// cares about requests that contain the `Authorization` header.
interface AuthParams {
  bToken: Header<"b_token">;
}

// The AuthData specifies the information about the authenticated user
// that the auth handler makes available.
interface AuthDataGroupon {
  userID: string;
  bToken: string;
  my_session_mandatory_id: string;
}

// The auth handler itself.
export const auth = authHandler<AuthParams, AuthDataGroupon>(async (params) => {
  console.log("authHandler - params", params);

  if (params.bToken != "test") {
    throw APIError.unauthenticated("bad credentials. My description ");
  }

  return {
    userID: "my-user-id",
    bToken: params.bToken,
    my_session_mandatory_id: "aaasss",
  };
});

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
  authHandler: auth,
});
