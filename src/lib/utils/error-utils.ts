import { ZodError } from "zod";

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (isZodError(error)) {
    return {
      error: "Invalid input data",
      details: error.errors.map(err => ({
        message: err.message,
        path: err.path
      })),
      status: 400
    };
  }

  return {
    error: "Internal server error",
    status: 500
  };
}