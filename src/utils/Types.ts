import {AuthenticationErrors, GeneralErrors, IdeaErrors, UserErrors} from "../Global/BackendErrors";
import {Roles} from "../modules/Users/Roles";
import {UploadedFile} from "express-fileupload";
import {Language} from "./Transalator";

export interface ApplicationError {
  code: GeneralErrors | AuthenticationErrors | UserErrors | IdeaErrors;
  message: string;
  details?: any;
}

export interface ApplicationResponse<DataType> {
  success: boolean;
  data?: DataType;
  error?: ApplicationError;
}

export interface ApplicationError {
  code: GeneralErrors | AuthenticationErrors | UserErrors | IdeaErrors;
  message: string;
  details?: any;
}

export type IntranetReject = (error: ApplicationError) => void;

export interface UserSession {
  id: number;
  pseudo: string;
  email: string;
  lastConnexionDate: Date;
  wsToken: string;
  role: Roles;
  language: Language;
  isAdmin: boolean;
  archived: boolean;
}

export interface ApplicationUserSessionToken {
  currentUser: UserSession;
  iat: number;
  exp: number;
}

export interface ApplicationRequest<BodyData> extends Request {
  request: UserSession;
  rawToken: string;
  hasValidToken: boolean;
  tokenDecryptedData?: ApplicationUserSessionToken;
  body: BodyData;
  files?: UploadedFile[];
  headers: {
    "x-access-token": string;
    "x-user-token"?: string;
  };
}

export type ApplicationResponsePromise<DataType> = Promise<
  ApplicationResponse<DataType>
  >;

export enum TypeAccessTokenType {
  WS_TOKEN = "WS_TOKEN",
  EDIT_EMAIL_VERIFIED = "EDIT_EMAIL_VERIFIED",
  VERIFIED_REGISTER = "VERIFIED_REGISTER",
  PASSWORD_RESET = "PASSWORD_RESET"
}
