export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly fields?: Record<string, string>;

  constructor(
    messageOrStatus: string | number,
    statusCodeOrMessage: number | string = 500,
    fields?: Record<string, string>
  ) {
    let msg: string;
    let code: number;
    if (typeof messageOrStatus === 'number') {
      code = messageOrStatus;
      msg = String(statusCodeOrMessage);
    } else {
      msg = messageOrStatus;
      code = typeof statusCodeOrMessage === 'number' ? statusCodeOrMessage : 500;
    }
    super(msg);
    this.statusCode = code;
    this.isOperational = true;
    this.fields = fields;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
