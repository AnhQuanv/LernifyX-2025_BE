import { Logger } from '@nestjs/common';

export class ExceptionHandler {
  static handleHttp(
    statusCode: number,
    message: string,
    method: string,
    url: string,
    logger: Logger,
  ) {
    logger.warn(
      `[HttpException] ${statusCode} - ${method} ${url} - ${message}`,
    );
  }

  static handleSystem(error: unknown, logger: Logger, context?: string): never {
    const err = error as Error;
    const label = context ? `[${context}]` : '';
    logger.error(`${label} ${err.message}`, err.stack);
    throw error;
  }
}
