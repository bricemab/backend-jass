import {AuthenticationErrors, GeneralErrors, UserErrors} from "../Global/BackendErrors";
import {Roles} from "../modules/Users/Roles";

export interface ApplicationError {
  code: GeneralErrors | AuthenticationErrors | UserErrors;
  message: string;
  details?: any;
}

export interface ApplicationResponse<DataType> {
  success: boolean;
  data?: DataType;
  error?: ApplicationError;
}

export interface ApplicationError {
  code: GeneralErrors | AuthenticationErrors | UserErrors;
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
  headers: {
    "x-access-token": string;
    "x-user-token"?: string;
  };
}

export type ApplicationResponsePromise<DataType> = Promise<
  ApplicationResponse<DataType>
  >;

export enum TypeAccessTokenType {
  WS_TOKEN = "WS_TOKEN"
}
