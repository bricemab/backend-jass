import GlobalStore from "./GlobalStore";
import {Pool, ResultSetHeader} from "mysql2";
import {DatabaseSettings} from "../Global/DatabaseType";
import {Pool as PromisePool} from "mysql2/promise";
import util from "util";
import {ApplicationError} from "./Types";
import Logger from "./Logger";
import crypto from "crypto";
import qs from "qs";

export default {
  buildHmacSha256Signature(parameters: Object) {
    const dataQueryString = qs.stringify(parameters); // .replace("%20", "+");
    // @ts-ignore
    return crypto
      .createHmac("sha256", this.getDbSetting("hmacSecretPacketKeyClient"))
      .update(dataQueryString)
      .digest("hex");
  },
  validateHmacSha256Signature (token: string, data: Object) {
    const signature = this.buildHmacSha256Signature(data);
    return signature === token;
  },
  buildHmacSha256SignatureWs(parameters: Object) {
    const dataQueryString = qs.stringify(parameters); // .replace("%20", "+");
    // @ts-ignore
    return crypto
      .createHmac("sha256", this.getDbSetting("hmacSecretPacketKeyWs"))
      .update(dataQueryString)
      .digest("hex");
  },
  validateHmacSha256SignatureWs (token: string, data: Object) {
    const signature = this.buildHmacSha256SignatureWs(data);
    return signature === token;
  },
  generateCurrentDateFileName() {
    const today = new Date();
    return `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
  },
  castMysqlRecordsToArray<ResultsType>(rows: any): ResultsType[] | undefined {
    if (Array.isArray(rows)) {
      return rows[0];
    }
  },
  castMysqlRecordToObject<ResultsType>(rows: any): ResultsType | undefined {
    const [data] = rows;
    if (Array.isArray(data)) {
      return data[0];
    }
    return data;
  },
  getMysqlPool(): PromisePool {
    return GlobalStore.getItem<PromisePool>("dbConnection");
  },
  async executeMysqlRequest(fn: any) {
    const [results, other]: [ResultSetHeader, any] = await fn;
    return results;
  },
  getDbSettings() {
    return GlobalStore.getItem("dbSettings");
  },
  getDbSetting(key: string): string {
    return (GlobalStore.getItem<DatabaseSettings[]>("dbSettings").find(el => el.key === key)).value as string;
  },
  manageError(errorMessage: ApplicationError) {
    Logger.error(errorMessage.toString());
    this.debug(errorMessage);
  },
  debug(variable: any) {
    console.log(util.inspect(variable, false, null, true /* enable colors */));
  },
  uniqueId(length?: number) {
    const ALPHABET =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (!length) {
      length = 9;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }

    return result;
  },
  replaceAllString(str: string, find: string, replace: string) {
    function escapeRegExp(string: string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
  },
  shortId() {
    return `_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  },
}
