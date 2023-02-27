import { Permissions } from "./permissions";

// eslint-disable-next-line import/prefer-default-export
export const RolesAllowedPermissions = {
  ANONYMOUS_USER: [],
  USER_LOGGED: [
    Permissions.usersManager.changePassword
  ],
  USER_ADMIN: [
    Permissions.usersManager,
  ]
};
