/**
 * Firebase Admin Stub
 */
export const adminStorage = {
  bucket: () => ({
    file: (_path: string) => ({
      save: async () => {},
      getSignedUrl: async () => ["https://mock-url.com"]
    })
  })
};

export const adminAuth = {
  verifyIdToken: async (_token: string) => ({ uid: "mock-uid" })
};
