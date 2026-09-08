import { httpError } from '../utils/http-error.mjs';

// Role guard. Use after `authenticate`. Enforces the role permissions from
// docs/authentication-contract.md on the server, regardless of what the UI shows.
export function authorize(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user) {
      next(httpError(401, 'TOKEN_INVALID', 'Authentication is required.'));
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(request.user.role)) {
      next(httpError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}
