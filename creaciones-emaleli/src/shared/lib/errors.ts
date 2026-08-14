export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(
    message: string,
    options: { statusCode?: number; code?: string } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? "APP_ERROR";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un error inesperado.";
}
