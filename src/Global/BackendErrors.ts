import {ApplicationError} from "../utils/Types";

export enum GeneralErrors {
  UNHANDLED_ERROR = "UNHANDLED_ERROR",
  PACKET_NOT_AUTHENTIC = "PACKET_NOT_AUTHENTIC",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SYSTEM_ERROR = "SYSTEM_ERROR",
  METHOD_NOT_IMPLEMENTED = "METHOD_NOT_IMPLEMENTED",
  DATABASE_REQUEST_ERROR = "DATABASE_REQUEST_ERROR",
  OBJECT_NOT_FOUND_IN_DATABASE = "OBJECT_NOT_FOUND_IN_DATABASE"
}

export enum AuthenticationErrors {
  AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
  AUTH_BLOCKED = "AUTH_BLOCKED",
  AUTH_MUST_BE_LOGGED_OFF = "AUTH_MUST_BE_LOGGED_OFF",
  AUTH_MUST_BE_LOGGED_ON = "AUTH_MUST_BE_LOGGED_ON",
  AUTH_NO_TOKEN_PROVIDED = "AUTH_NO_TOKEN_PROVIDED",
  AUTH_TOKEN_IS_NOT_AUTHENTIC = "AUTH_TOKEN_IS_NOT_AUTHENTIC",
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_NO_ROLE_ALLOWED = "AUTH_NO_ROLE_ALLOWED",
  AUTH_USER_CLIENT_CONVERSION_FAILED = "AUTH_USER_CLIENT_CONVERSION_FAILED",
  AUTH_ACCESS_TO_INTRANET_NOT_ALLOWED = "AUTH_ACCESS_TO_INTRANET_NOT_ALLOWED",
  AUTH_DISABLED_ACCOUNT = "AUTH_DISABLED_ACCOUNT",
  ACCESS_NOT_AUTHORIZED = "ACCESS_NOT_AUTHORIZED"
}

export enum UserErrors {
  USER_PSEUDO_MUST_BE_UNIQUE = "USER_PSEUDO_MUST_BE_UNIQUE",
  USER_EMAIL_MUST_BE_UNIQUE = "USER_EMAIL_MUST_BE_UNIQUE",
  PSEUDO_OR_EMAIL_NOT_FOUND = "PSEUDO_OR_EMAIL_NOT_FOUND",
}

export enum IdeaErrors {
  IDEA_SAVE_FILE_ERROR = "IDEA_SAVE_FILE_ERROR",
  IDEA_PREPARE_NEW_IDEA = "IDEA_PREPARE_NEW_IDEA"
}

export type ApplicationReject = (error: ApplicationError) => void;
