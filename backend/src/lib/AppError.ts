export class AppError extends Error {
  status: number;
  errors?: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static notFound(message = "Data not found") {
    return new AppError(404, message);
  }

  static badRequest(message = "Invalid request", errors?: unknown) {
    return new AppError(400, message, errors);
  }

  static conflict(message = "Data already exists") {
    return new AppError(409, message);
  }
}
