/**
 * Vercel Serverless Entry Point
 *
 * This file loads the fully self-contained Express app bundle (dist/server.cjs).
 * All dependencies (firebase-admin, twilio, express, etc.) are bundled into
 * dist/server.cjs by esbuild — no node_modules lookup needed at runtime.
 */

const app = require('../dist/server.cjs');

// Support both ESM default export and direct module.exports
module.exports = app.default || app;
