import {TypeAccessTokenType} from "../utils/Types";
import {Language} from "../utils/Transalator";

export interface DatabaseSettings {
  key: string;
  value: string;
  description: string
}

export interface DatabaseUser{
  id: number;
  pseudo: string;
  email: string;
  password: string;
  registration_date: Date;
  last_connexion_date: Date;
  verified_date: Date | null;
  ws_token: string;
  language: Language;
  is_verified: boolean;
  is_admin: boolean;
  is_archived: boolean;
}

export interface DatabaseConcatMessage {
  id: number;
  subject: string;
  content: string;
  date: Date;
  email: string;
}

export interface DatabaseAccessToken {
  id: number;
  user_id: number;
  start_date: Date;
  expiration_date: Date;
  token: string;
  type: TypeAccessTokenType;
  is_finished: number;
}
