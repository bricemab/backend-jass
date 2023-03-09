import {Response, Router} from "express";
import RequestManager from "../Global/RequestManager";
import {ApplicationRequest, TypeAccessTokenType, UserSession} from "../utils/Types";
import AclManager from "../permissions/AclManager";
import {Permissions} from "../permissions/permissions";
import {AuthenticationErrors, GeneralErrors, UserErrors} from "../Global/BackendErrors";
import UsersManager from "../modules/Users/UsersManager";
import UserEntity from "../modules/Users/UserEntity";
// @ts-ignore
import moment from "moment";
import Utils from "../utils/Utils";
import AccessTokenEntity from "../modules/AccessTokens/AccessTokenEntity";
import {Roles} from "../modules/Users/Roles";
// @ts-ignore
import jwt from "jsonwebtoken";
import WsManager from "../services/Ws/WsManager";
import GlobalStore from "../utils/GlobalStore";
import Mailer from "../services/Mailer/Mailer";
import Translator, {Language} from "../utils/Transalator";
import AccessTokensManager from "../modules/AccessTokens/AccessTokensManager";

const UsersRouter = Router();

UsersRouter.post(
  "/authentication",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          username: string;
          password: string;
        };
      }>,
      response: Response
    ) => {
      if (request.hasValidToken) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You have to be logged off"
          }
        })
      }

      if (
        !request.body.data &&
        !request.body.data.username &&
        !request.body.data.password
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.VALIDATION_ERROR,
            message: "Data are not correctly provided"
          }
        })
      }

      const { username, password } = request.body.data;

      const userResponse = await UsersManager.findUserLogin(username);
      if (!userResponse.success && !userResponse.data) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_INVALID_CREDENTIALS,
            message: "Invalid credentials"
          }
        });
      }
      const { user } = userResponse.data;
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_INVALID_CREDENTIALS,
            message: "Invalid credentials"
          }
        });
      }

      const wsToken = Utils.uniqueId(50);
      const accessToken = new AccessTokenEntity(null, user.id, moment(), moment().add("8", "hours"), wsToken, TypeAccessTokenType.WS_TOKEN, false);
      await accessToken.save();

      user.lastConnexionDate = moment();
      user.wsToken = wsToken;
      await user.save();

      const userJSON = user.toJSON();
      const userSession: UserSession = {
        ...userJSON,
        role: user.isAdmin ? Roles.USER_ADMIN : Roles.USER_LOGGED
      } as UserSession;

      const token = jwt.sign(
        {
          currentUser: userSession
        },
        Utils.getDbSetting("jwtTokenSecretKey"),
        {
          expiresIn: `8h`
        }
      );

      RequestManager.sendResponse(response, {
        success: true,
        data: {
          token,
          user: userSession,
          role: userSession.role
        }
      })
    })
);

UsersRouter.post(
  "/register",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          pseudo: string;
          email: string;
          password: string;
        };
      }>,
      response: Response
    ) => {
      if (request.hasValidToken) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You have to be logged off"
          }
        })
      }

      if (
        !request.body.data &&
        !request.body.data.pseudo &&
        !request.body.data.email &&
        !request.body.data.password
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.VALIDATION_ERROR,
            message: "Data are not correctly provided"
          }
        })
      }

      const { pseudo, email, password } = request.body.data;

      const emailUserUniqueResponse = await UsersManager.findByEmail(email);
      if (emailUserUniqueResponse.success && emailUserUniqueResponse.data) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.USER_EMAIL_MUST_BE_UNIQUE,
            message: "Email must be unique"
          }
        })
      }
      const pseudoUserUniqueResponse = await UsersManager.findByPseudo(pseudo);
      if (pseudoUserUniqueResponse.success && pseudoUserUniqueResponse.data) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.USER_PSEUDO_MUST_BE_UNIQUE,
            message: "Email must be unique"
          }
        })
      }

      const wsToken = Utils.uniqueId(50);
      const user = new UserEntity(null, pseudo, email, password, moment(), moment(), wsToken, Language.FR, false,false);
      await user.setPasswordEncrypt(password);
      await user.save();

      const accessToken = new AccessTokenEntity(null, user.id, moment(), moment().add("8", "hours"), wsToken, TypeAccessTokenType.WS_TOKEN, false);
      await accessToken.save();

      const userJSON = user.toJSON();
      const userSession: UserSession = {
        ...userJSON,
        role: user.isAdmin ? Roles.USER_ADMIN : Roles.USER_LOGGED
      } as UserSession;

      const token = jwt.sign(
        {
          currentUser: userSession
        },
        Utils.getDbSetting("jwtTokenSecretKey"),
        {
          expiresIn: `8h`
        }
      );

      RequestManager.sendResponse(response, {
        success: true,
        data: {
          token,
          user: userSession,
          role: userSession.role
        }
      })
    })
);

UsersRouter.post(
  "/ask-reset-password",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          emailOrPseudo: string;
        };
      }>,
      response: Response
    ) => {
      if (request.hasValidToken) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You have to be logged off"
          }
        })
      }

      if (
        !request.body.data &&
        !request.body.data.emailOrPseudo
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.VALIDATION_ERROR,
            message: "Data are not correctly provided"
          }
        })
      }

      const { emailOrPseudo } = request.body.data;

      const userResponse = await UsersManager.findUserLogin(emailOrPseudo);
      if (!userResponse.data && !userResponse.success) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: UserErrors.PSEUDO_OR_EMAIL_NOT_FOUND,
            message: "Email or pseudo not find",
            details: emailOrPseudo
          }
        })
      }

      const { user } = userResponse.data;
      const token = Utils.uniqueId(50);
      const tokenEntity = new AccessTokenEntity(null, user.id!, moment(), moment().add(1, "hours"), token, TypeAccessTokenType.PASSWORD_RESET, false);
      await tokenEntity.save();
      const resetPasswordResponse = await UsersManager.prepareResetPasswordMail(user, tokenEntity);
      if (!resetPasswordResponse.success && !resetPasswordResponse.data) {
        return RequestManager.sendResponse(response, resetPasswordResponse);
      }
      const { content } = resetPasswordResponse.data;
      const Mailer = GlobalStore.getItem('mailer') as Mailer;
      Mailer.addMailQueue(user.email, Translator.t('user.resetPasswordSubject', user.language), content, "E-Jass")
      return RequestManager.sendResponse(response, {
        success: true,
        data: {}
      })
    })
);

UsersRouter.post(
  "/verify-reset-password-token",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          token: string;
        };
      }>,
      response: Response
    ) => {
      if (request.hasValidToken) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You have to be logged off"
          }
        })
      }

      if (
        !request.body.data &&
        !request.body.data.token
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.VALIDATION_ERROR,
            message: "Data are not correctly provided"
          }
        })
      }

      const { token } = request.body.data;

      const accessTokenResponse = await AccessTokensManager.findByToken(token);
      if (!accessTokenResponse.success && !accessTokenResponse.data) {
        return RequestManager.sendResponse(response, accessTokenResponse);
      }
      const { accessToken } = accessTokenResponse.data;
      if (accessToken.expirationDate.diff(moment()) < 0 || accessToken.isFinished) {
        return RequestManager.sendResponse(response, {
          success: false,
          data: {}
        })
      }

      return RequestManager.sendResponse(response, {
        success: true,
        data: {}
      })
    })
);

UsersRouter.post(
  "/reset-password",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          token: string;
          password: string;
        };
      }>,
      response: Response
    ) => {
      if (request.hasValidToken) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: AuthenticationErrors.AUTH_MUST_BE_LOGGED_OFF,
            message: "You have to be logged off"
          }
        })
      }

      if (
        !request.body.data &&
        !request.body.data.password &&
        !request.body.data.token
      ) {
        return RequestManager.sendResponse(response, {
          success: false,
          error: {
            code: GeneralErrors.VALIDATION_ERROR,
            message: "Data are not correctly provided"
          }
        })
      }

      const { token, password } = request.body.data;

      const accessTokenResponse = await AccessTokensManager.findByToken(token);
      if (!accessTokenResponse.success && !accessTokenResponse.data) {
        return RequestManager.sendResponse(response, accessTokenResponse);
      }
      const { accessToken } = accessTokenResponse.data;
      if (accessToken.expirationDate.diff(moment()) < 0 || accessToken.isFinished) {
        return RequestManager.sendResponse(response, {
          success: false,
          data: {}
        })
      }

      const userResponse = await UsersManager.findById(accessToken.userId);
      const { user } = userResponse.data!;
      await user.setPasswordEncrypt(password);
      await user.save();
      accessToken.isFinished = true;
      await accessToken.save();

      return RequestManager.sendResponse(response, {
        success: true,
        data: {}
      })
    })
);

UsersRouter.post(
  "/test",
  AclManager.routerHasPermission(Permissions.specialState.userLoggedOff),
  RequestManager.asyncResolver(
    async (
      request: ApplicationRequest<{
        token: string;
        data: {
          pseudo: string;
          email: string;
          password: string;
        };
      }>,
      response: Response
    ) => {

      const {ws} = GlobalStore.getItem<WsManager>("ws");
      // @ts-ignore
      WsManager.sendMessageToServer(ws, Utils.uniqueId(24), "test", {test: "letsgo"}, true)

      return RequestManager.sendResponse(response, {
        success: true,
        data: {}
      })
    })
);

export default UsersRouter;
