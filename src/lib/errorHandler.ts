/**
 * @file errorHandler.ts
 * @summary Defines the error handler tools.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

/**
 * @summary An error received from the API.
 * @param message the message to throw
 */
const ThrowInvalidIncomingDataErr = (message: string) => {
  throw new Error(`Status: 502. Message: The data from API is illegal: ${message}`);
};

export { ThrowInvalidIncomingDataErr };
