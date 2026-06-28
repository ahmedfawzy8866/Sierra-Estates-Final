"use strict";
/**
 * Admin Seed — One-time Cloud Function to bootstrap the `admins` Firestore collection.
 *
 * Deploy and invoke once to seed admin emails, then delete the function.
 *
 * Deploy:
 *   firebase deploy --only functions:adminSeed
 *
 * Invoke:
 *   curl -X POST "https://europe-west1-sierra-blu.cloudfunctions.net/adminSeed" \
 *     -H "Authorization: Bearer $(gcloud auth print-identity-token)"
 *
 * After seeding, you can remove the hardcoded emails from isBootstrappedAdmin()
 * in firestore.rules.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSeed = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const ADMIN_EMAILS = [
    { email: 'A.fawzy8866@gmail.com', role: 'super_admin', name: 'Ahmed Fawzy' },
    { email: 'a.fawzy8866@gmail.com', role: 'admin', name: 'Ahmed Fawzy (alt)' },
    { email: 'emeraldestatesegypt@gmail.com', role: 'admin', name: 'Emerald Estates' },
];
exports.adminSeed = (0, https_1.onRequest)({ region: 'europe-west1' }, async (req, res) => {
    // Only allow POST method
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }
    // Verify the caller is authenticated (via Firebase ID token or App Check)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
        return;
    }
    try {
        // Verify the ID token
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        // Check if the caller is a bootstrapped admin
        const callerEmail = decodedToken.email;
        const isBootstrapAdmin = ADMIN_EMAILS.some(a => a.email === callerEmail);
        if (!isBootstrapAdmin) {
            res.status(403).json({ error: 'Forbidden: Caller is not a bootstrapped admin' });
            return;
        }
        // Seed the admins collection
        const batch = db.batch();
        for (const adminEntry of ADMIN_EMAILS) {
            const ref = db.collection('admins').doc(adminEntry.email);
            batch.set(ref, {
                email: adminEntry.email,
                role: adminEntry.role,
                name: adminEntry.name,
                createdAt: FieldValue.serverTimestamp(),
                createdBy: 'admin-seed-function',
                seededBy: callerEmail,
            });
        }
        await batch.commit();
        res.json({
            success: true,
            message: `Seeded ${ADMIN_EMAILS.length} admin entries`,
            admins: ADMIN_EMAILS.map(a => a.email),
        });
    }
    catch (error) {
        console.error('[adminSeed] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=admin-seed.js.map