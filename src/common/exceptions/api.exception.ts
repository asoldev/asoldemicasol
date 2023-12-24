import { HttpException } from '@nestjs/common';
import {
  ErrorCodeMap,
  ErrorCodeMapType,
} from '../contants/error-code.contants';

/**
 * Api If the exception occurs, the exception will be thrown.
 */
export class ApiException extends HttpException {
  /**
   * Type error code, not Http code
   */
  private errorCode: ErrorCodeMapType;

  constructor(errorCode: ErrorCodeMapType) {
    super(ErrorCodeMap[errorCode], 200);
    this.errorCode = errorCode;
  }

  getErrorCode(): ErrorCodeMapType {
    return this.errorCode;
  }
}
