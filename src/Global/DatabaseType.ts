import {TypeAccessTokenType} from "../utils/Types";

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
  ws_token: string;
  is_admin: boolean;
  is_archived: boolean;
}

export interface DatabaseAccessToken {
  id: number;
  user_id: number;
  start_date: Date;
  expiration_date: Date;
  token: string;
  type: TypeAccessTokenType
}
