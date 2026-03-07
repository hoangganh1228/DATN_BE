import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorCodeKey } from '../constants/error-code.constant';


export class AppException extends HttpException {
  public readonly errorCode: string;

  constructor(
    key: ErrorCodeKey,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    detail?: string,                  // thông tin thêm nếu cần
  ) {
    const { code, message } = ErrorCode[key];

    super(
      {
        errorCode: code,
        message: detail ?? message,
      },
      httpStatus,
    );

    this.errorCode = code;
  }
}