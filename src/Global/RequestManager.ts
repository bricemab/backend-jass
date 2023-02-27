import { Response } from "express";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { ApplicationError, ApplicationResponse } from "../utils/Types";
import Utils from "../utils/Utils";
import GlobalStore from "../utils/GlobalStore";
import { ApplicationReject } from "./BackendErrors";

/*
 * Classe regroupant des outils en lien avec les requêtes.
 */
export default class RequestManager {
  /*
   * Middleware permetant l'utilisation de methodes asynchrones dans les routes. Si pas utilisé risque de bloquer des requetes.
   *
   * Parameter: fn - Fonction à éxécuter dans la route.
   */
  static asyncResolver(fn: any) {
    return (request: any, response: any, next: any) => {
      Promise.resolve(fn(request, response, next)).catch(
        (error: ApplicationError) => {
          Utils.manageError(error);
          RequestManager.sendResponse(response, {
            success: false,
            error
          });
        }
      );
    };
  }

  /*
   * Permet de formatter de manière standard les réponses JSON à envoyer aux clients .
   *
   * Parameter: response - Objet response express.
   * Parameter: dataToSend - Données à envoyer au client.
   * Parameter: status - Code status à mettre dans le header HTTP.
   */
  static sendResponse(
    response: Response,
    dataToSend: ApplicationResponse<any>,
    status?: number
  ) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    if (dataToSend && dataToSend.success) {
      response.status(200).json(dataToSend);
    } else {
      response.status(status || 460).json({
        success: false,
        error: dataToSend.error
      });
    }
  }

  // static executePost<DataType>(
  //   url: string,
  //   params: any,
  //   specialConfig?: AxiosRequestConfig
  // ) {
  //   const wpInstance = GlobalStore.getItem("wpInstance") as AxiosInstance;
  //   return new Promise<DataType>((resolve, reject: ApplicationReject) => {
  //     wpInstance
  //       .post(url, params, specialConfig)
  //       .then(response => {
  //         const { status, data } = response;
  //         resolve(data);
  //       })
  //       .catch(error => {
  //         console.log(error);
  //         resolve(error.response.data);
  //       });
  //   });
  // }
}
