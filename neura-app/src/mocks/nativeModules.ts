/**
 * Temporary mocks for native modules to enable UI testing in Expo Go
 * Remove this file when building for production or development builds
 */

// Mock WatermelonDB database
export const mockDatabase = {
  write: async (fn: any) => fn(),
  read: async (fn: any) => fn(),
  batch: async (...args: any[]) => {},
  get: (tableName: string) => mockCollection,
};

export const mockCollection = {
  query: (...args: any[]) => ({
    fetch: async () => [],
    observe: () => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  }),
  create: async (fn: any) => fn({}),
  find: async () => null,
};

// Mock WatermelonDB exports
export const Database = class MockDatabase {};
export const Model = class MockModel {};
export const Q = {
  where: () => {},
  and: () => {},
  or: () => {},
  sortBy: () => {},
  take: () => {},
  skip: () => {},
  desc: 'desc',
  asc: 'asc',
};
export const field = () => () => {};
export const text = () => () => {};
export const date = () => () => {};
export const readonly = () => () => {};
export const writer = () => () => {};
export const appSchema = () => ({});
export const tableSchema = () => ({});
export const DatabaseProvider = ({ children }: any) => children;
export const SQLiteAdapter = class MockSQLiteAdapter {};

// Default export for when imported as default
export default {
  Database,
  Model,
  Q,
  field,
  text,
  date,
  readonly,
  writer,
  appSchema,
  tableSchema,
  DatabaseProvider,
  SQLiteAdapter,
  mockDatabase,
  mockCollection,
};
