/**
 * @file errorHandler.ts
 * @summary Defines the error handler tools.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

// A simple class for error.
class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

/**
 * @summary An error received from the API.
 * @param message the message to throw
 */
const ThrowInvalidIncomingDataErr = (message: string) => {
  throw new HttpError(502, `The data from API is illegal: ${message}`);
};

export { ThrowInvalidIncomingDataErr };
