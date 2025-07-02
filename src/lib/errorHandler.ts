/**
 * @file errorHandler.ts
 * @summary Defines the error handler tools.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import axios from 'axios';

/**
 * @summary An error received from the API.
 * @param message the message to throw
 */
const ThrowInvalidIncomingDataErr = (message: string): never => {
  throw new Error(`Status: 502. Message: The data from API is illegal: ${message}`);
};

/**
 * @summary An unexpected error.
 * @param message the message to throw
 */
const ThrowInternalError = (message: string): never => {
  throw new Error(`Status: 500. Message: An unexpected error: ${message}`);
};

/**
 * @summary Throws an error from API fetching, can be an axios error, or parsing error.
 * @param error The Error object.
 */
const ThrowFetchingError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new Error(
      `Status: ${error.response?.status ?? 500}. Message: An error from API: ${JSON.stringify(error.response?.data)}`,
    );
  } else {
    throw error;
  }
};

export { ThrowFetchingError, ThrowInternalError, ThrowInvalidIncomingDataErr };
