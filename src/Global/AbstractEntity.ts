import { validateOrReject, ValidationError } from "class-validator";
import { IntranetReject, ApplicationResponse } from "../utils/Types";
import { GeneralErrors } from "./BackendErrors";

export default abstract class AbstractEntity {
  hasBeenModified: boolean;

  protected constructor() {
    this.hasBeenModified = false;
  }

  validateAttributes(): Promise<ApplicationResponse<any>> {
    return new Promise((resolve, reject: IntranetReject) => {
      validateOrReject(this)
        .then(() => {
          resolve({ success: true });
        })
        .catch((rawErrors: Array<ValidationError> | string) => {

          if (Array.isArray(rawErrors)) {
            const errors = rawErrors.map((row: ValidationError) => {
              const { property, constraints } = row;
              return {
                field: property,
                errors: Object.keys(constraints)
              };
            });

            reject({
              code: GeneralErrors.VALIDATION_ERROR,
              message: "Some fields were couldn't pass validation",
              details: errors
            });
          } else {
            reject({
              code: GeneralErrors.UNHANDLED_ERROR,
              message: "Some fields were couldn't pass validation",
              details: rawErrors
            });
          }
        });
    });
  }
}
