import { Header, Gateway, APIError } from "../../../../../../../../../opt/homebrew/Cellar/encore/1.41.9/libexec/runtimes/js/encore.dev/api/mod";
import { authHandler } from "../../../../../../../../../opt/homebrew/Cellar/encore/1.41.9/libexec/runtimes/js/encore.dev/auth/mod";

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

  if (params.authorization != "test") {
    throw APIError.unauthenticated("bad credentials. My description ");
  }

  return {
    userID: "my-user-id",
    my_session_mandatory_id: "aaa",
  };
});

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
  authHandler: auth,
});
