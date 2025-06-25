/**
 * @file errorHandler.ts
 * @summary Defines the error handler tools.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import type { AxiosError } from 'axios';

/**
 * @summary An error received from the API.
 * @param message the message to throw
 */
const ThrowInvalidIncomingDataErr = (message: string) => {
  throw new Error(`Status: 502. Message: The data from API is illegal: ${message}`);
};

/**
 * @summary An unexpected error.
 * @param message the message to throw
 */
const ThrowInternalError = (message: string) => {
  throw new Error(`Status: 500. Message: An unexpected error: ${message}`);
};

/**
 * @summary Throws an error from axios.
 * @param error The AxiosError object.
 */
const ThrowAxiosError = (error: AxiosError) => {
  throw new Error(
    `Status: ${error.response?.status ?? 500}. Message: An error from API: ${JSON.stringify(error.response?.data)}`,
  );
};

export { ThrowAxiosError, ThrowInternalError, ThrowInvalidIncomingDataErr };
