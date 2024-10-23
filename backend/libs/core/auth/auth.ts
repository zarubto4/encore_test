import { Header, Gateway, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

// AuthParams specifies the incoming request information
// the auth handler is interested in. In this case it only
// cares about requests that contain the `Authorization` header.
interface AuthParams {
  b_token: Header<"b_token">;
}

// The AuthData specifies the information about the authenticated user
// that the auth handler makes available.
interface AuthDataGroupon {
  userID: string; // Mandatory by Encore!
  b_token: string;
}

// The auth handler itself.
export const auth = authHandler<AuthParams, AuthDataGroupon>(async (params) => {
  if (params.b_token != "XXX" && params.b_token != "YYY") {
    throw APIError.unauthenticated("bad credentials. My description");
  }

  return {
    userID: "my-user-id", // Mandatory by Encore!
    b_token: params.b_token,
  };
});

// Define the API Gateway that will execute the auth handler:
export const gateway = new Gateway({
  authHandler: auth,
});
