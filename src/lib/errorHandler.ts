/**
 * @file errorHandler.ts
 * @summary Defines the error handler tools.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import axios from 'axios';

const ThrowInvalidIncomingDataErr = (message: string): never => {
  throw new Error(`Status: 502. Message: The data from API is illegal: ${message}`);
};

const ThrowInternalError = (message: string): never => {
  throw new Error(`Status: 500. Message: An unexpected error: ${message}`);
};

const ThrowFetchingError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new Error(
      `Status: ${error.response?.status ?? 500}. Message: An error from API: ${JSON.stringify(error.response?.data)}`,
    );
  } else {
    throw error;
  }
};

const ThrowBackendError = (message: string): never => {
  throw new Error(`Status: 502. Message: An error from backend: ${message}`);
};

export { ThrowBackendError, ThrowFetchingError, ThrowInternalError, ThrowInvalidIncomingDataErr };
