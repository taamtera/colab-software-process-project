// Builds an Error carrying the HTTP status and shared error code that
// middleware/error-handler.mjs turns into the `{ error: { code, message, requestId } }`
// response shape defined in docs/authentication-contract.md.
export function httpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}
