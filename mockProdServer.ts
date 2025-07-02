import { createProdMockServer } from 'vite-plugin-mock/client'

import testModule from './mock/test'

// A mocked server for debugging.
export function setupProdMockServer() {
  createProdMockServer([...testModule])
}