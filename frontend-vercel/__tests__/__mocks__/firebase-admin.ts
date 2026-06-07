// Mock firebase-admin database state using global to bridge hoisting
const mockDb = {
  collection: jest.fn((name: string) => {
    const coll: any = {
      add: jest.fn(async (data) => {
        const id = `mock-id-${Date.now()}`;
        const state = (global as any).mockDbState || { rawScrapeData: {}, processedDataStore: {} };
        state.rawScrapeData[id] = data;
        return { id };
      }),
      doc: jest.fn((docId) => ({
        set: jest.fn(async (data) => {
          const state = (global as any).mockDbState || { rawScrapeData: {}, processedDataStore: {} };
          state.processedDataStore[docId] = data;
        }),
        get: jest.fn(async () => ({
          exists: true,
          data: () => ({}),
        })),
        update: jest.fn(async () => true),
      })),
    };
    return coll;
  }),
};

const firestoreMock: any = () => mockDb;
firestoreMock.FieldValue = {
  serverTimestamp: jest.fn(() => '__TIMESTAMP__'),
};

export const apps = [];
export const initializeApp = jest.fn();
export const firestore = firestoreMock;

export default {
  apps,
  initializeApp,
  firestore,
};
