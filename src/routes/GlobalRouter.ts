import {Response, response, Router} from "express";
import AclManager from "../permissions/AclManager";
import {Permissions} from "../permissions/permissions";
import {ApplicationRequest} from "../utils/Types";
import RequestManager from "../Global/RequestManager";
import {AuthenticationErrors, GeneralErrors} from "../Global/BackendErrors";
import ContactMessageEntity from "../modules/ContactMessages/ContactMessageEntity";
import moment from "moment";
import IdeaEntity from "../modules/Ideas/IdeaEntity";
import IdeasManager from "../modules/Ideas/IdeasManager";
import IdeasFilesManager from "../modules/IdeasFiles/IdeasFilesManager";
import Utils from "../utils/Utils";
import IdeasRouter from "./IdeasRouter";

const GlobalRouter = Router();

GlobalRouter.post(
  "/contact",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedIn),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        object: string;
        content: string;
      }>,
      response: Response
    ) => {
      if (!request.hasValidToken && !request.tokenDecryptedData && !request.tokenDecryptedData.currentUser) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You have to be logged on"
          }
        })
      }
      const {currentUser} = request.tokenDecryptedData;
      if (
        !request.body &&
        !request.body.object &&
        request.body.object.trim() === "" &&
        !request.body.content &&
        request.body.content.trim() === ""
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.VALIDATION_ERROR,
            message: "Data are not correctly provided"
          }
        })
      }
      const {content, object} = request.body;

      const contact = new ContactMessageEntity(null, object, content, moment(), currentUser.email);
      await contact.save();

      return RequestManager.sendResponse(response, {
        success: true,
        data: {}
      })
    })
);

export default GlobalRouter;
