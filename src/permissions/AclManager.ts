import { Response } from "express";
import { Permissions } from "./permissions";
import { RolesAllowedPermissions } from "./rolesPermissions";
import {
  ApplicationRequest,
  ApplicationUserSessionToken,
  UserSession
} from "../utils/Types";
import RequestManager from "../Global/RequestManager";
import { AuthenticationErrors } from "../Global/BackendErrors";
import { Roles } from "../modules/Users/Roles";

export default class AclManager {
  public static routerHasPermission(permissionTargeted: string): any {
    return (
      request: ApplicationRequest<any>,
      response: Response,
      next: any
    ) => {
      if (
        permissionTargeted === Permissions.specialState.allowAll ||
        permissionTargeted === Permissions.specialState.userLoggedOff
      ) {
        next();
        return;
      }

      if (
        AclManager.hasUserAccessToPermission(
          permissionTargeted,
          request.tokenDecryptedData
        )
      ) {
        next();
        return;
      }

      RequestManager.sendResponse(
        response,
        {
          success: false,
          error: {
            code: AuthenticationErrors.ACCESS_NOT_AUTHORIZED,
            message: "You are not allowed to use this function"
          }
        },
        403
      );
    };
  }

  public static hasUserAccessToPermission(
    routeRequiredPermission: string,
    tokenDecryptedData?: ApplicationUserSessionToken
  ): boolean {
    let hasPermission = false;
    let userRole = Roles.USER_ANONYMOUS;

    if (tokenDecryptedData && tokenDecryptedData.currentUser) {
      userRole = tokenDecryptedData.currentUser.role;
    }

    // Les routes spéciales sont gérées à part
    if (
      routeRequiredPermission &&
      routeRequiredPermission.includes("specialState.")
    ) {
      switch (routeRequiredPermission) {
        case Permissions.specialState.allowAll:
          return true;
        case Permissions.specialState.userLoggedIn:
          return !!tokenDecryptedData!.currentUser;
        case Permissions.specialState.userLoggedOff:
          return !tokenDecryptedData;
        default:
          console.error("Unkwown special permission, please specify it");
          console.error(routeRequiredPermission);
      }
    } else {
      // Toutes les permissions
      // eslint-disable-next-line no-prototype-builtins,no-lonely-if
      if (RolesAllowedPermissions.hasOwnProperty(userRole)) {
        const userPermissions: (string | Object)[] =
          // @ts-ignore
          RolesAllowedPermissions[userRole];

        userPermissions.forEach(userPermission => {
          if (typeof userPermission === "object") {
            if (
              Object.values(userPermission).includes(routeRequiredPermission)
            ) {
              hasPermission = true;
            }
          } else if (userPermission === routeRequiredPermission) {
            hasPermission = true;
          }
        });
      } else {
        console.error("This role must be declared in permissions");
        console.error(routeRequiredPermission);
      }
    }

    return hasPermission;
  }
}
