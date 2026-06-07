export const https = {
  onRequest: jest.fn((handler) => handler),
};

export const firestore = {
  document: jest.fn(() => ({
    onCreate: jest.fn((handler) => handler),
  })),
};

export default {
  https,
  firestore,
};
