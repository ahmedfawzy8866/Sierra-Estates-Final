import express from 'express';
import * as admin from 'firebase-admin';

const app = express();
app.use(express.json());

// Initialize firebase-admin
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "sierra-blu"
      });
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var, using default config:', err);
      admin.initializeApp({
        projectId: "sierra-blu"
      });
    }
  } else {
    admin.initializeApp({
      projectId: "sierra-blu"
    });
  }
}

const db = admin.firestore();

let pfToken: string | null = null;
let pfTokenExpiresAt: number = 0;

async function getPFToken(): Promise<string> {
  if (pfToken && Date.now() < pfTokenExpiresAt) {
    return pfToken;
  }

  const apiKey = process.env.PF_API_KEY;
  const apiSecret = process.env.PF_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('PF_API_KEY and PF_API_SECRET are not set.');
  }

  const reqBody = { apiKey, apiSecret };

  const res = await fetch('https://atlas.propertyfinder.com/v1/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(reqBody)
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('PF Token failure:', txt);
    throw new Error(`Failed to get Property Finder token. Status: ${res.status}`);
  }

  const data = await res.json();
  pfToken = data.accessToken;
  // Expire 1 minute early to be safe
  pfTokenExpiresAt = Date.now() + ((data.expiresIn - 60) * 1000);
  
  return pfToken as string;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/listings
app.get("/api/listings", async (req, res) => {
  try {
    const { id, limit: limitParam } = req.query;
    if (id) {
      const docSnap = await db.collection("listings").doc(id as string).get();
      if (!docSnap.exists) {
        res.status(404).json({ success: false, error: "Listing not found" });
        return;
      }
      res.json({ success: true, listing: { id: docSnap.id, ...docSnap.data() } });
      return;
    }

    let query: admin.firestore.Query = db.collection("listings");
    if (limitParam) {
      const parsedLimit = parseInt(limitParam as string, 10);
      if (!isNaN(parsedLimit)) {
        query = query.limit(parsedLimit);
      }
    }

    const snapshot = await query.get();
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, listings, count: listings.length });
  } catch (e: any) {
    console.error('Fetch Listings Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/leads
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email) {
      res.status(400).json({ success: false, error: "Name and email are required" });
      return;
    }

    const docRef = await db.collection("leads").add({
      name,
      email,
      phone: phone || "",
      interest: message || "",
      stage: "Initial Contact",
      hot: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ success: true, id: docRef.id });
  } catch (e: any) {
    console.error('Create Lead Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Example proxy for getting leads from Property Finder
app.get("/api/pf/leads", async (req, res) => {
  try {
    const token = await getPFToken();
    const qParams = new URLSearchParams(req.query as Record<string, string>);
    
    const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/leads?${qParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (e: any) {
    console.error('PF Leads Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Proxy for listings
app.get("/api/pf/listings", async (req, res) => {
  try {
    const token = await getPFToken();
    const qParams = new URLSearchParams(req.query as Record<string, string>);
    
    const upstreamRes = await fetch(`https://atlas.propertyfinder.com/v1/listings?${qParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await upstreamRes.json();
    res.status(upstreamRes.status).json(data);
  } catch (e: any) {
    console.error('PF Listings Error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default app;
