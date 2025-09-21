import { ApiResponseKey } from '../enums/api-response-key.enum';

export interface TApiResponse<T = null> {
  [ApiResponseKey.STATUS]: boolean;
  [ApiResponseKey.CODE]: number;
  [ApiResponseKey.MESSAGE]: string;
  [ApiResponseKey.TIMESTAMP]: string;
  [ApiResponseKey.DATA]?: T;
  [ApiResponseKey.ERRORS]?: string[];
  [ApiResponseKey.PATH]?: string;
  [ApiResponseKey.ERROR_CODE]?: string;
}

export class ApiResponse {
  static success<T>(
    data?: T,
    message: string = 'Success',
    code = 200,
  ): TApiResponse<T> {
    return {
      [ApiResponseKey.STATUS]: true,
      [ApiResponseKey.CODE]: code,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.TIMESTAMP]: new Date().toISOString(),
      [ApiResponseKey.DATA]: data,
    };
  }

  static error(
    message: string,
    code = 500,
    errors?: string[] | string,
    path?: string,
    errorCode?: string,
  ): TApiResponse<null> {
    const response: TApiResponse<null> = {
      [ApiResponseKey.STATUS]: false,
      [ApiResponseKey.CODE]: code,
      [ApiResponseKey.MESSAGE]: message,
      [ApiResponseKey.TIMESTAMP]: new Date().toISOString(),
      [ApiResponseKey.PATH]: path,
    };
    if (errorCode) {
      response[ApiResponseKey.ERROR_CODE] = errorCode;
    }

    if (errors) {
      const errorArray = Array.isArray(errors) ? errors : [errors];

      // Nếu chỉ có 1 lỗi và trùng message → không cần đưa vào errors
      if (!(errorArray.length === 1 && errorArray[0] === message)) {
        response[ApiResponseKey.ERRORS] = errorArray;
      }
    }

    return response;
  }
}
