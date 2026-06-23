import express from 'express';
import admin from 'firebase-admin';

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

const ESTATE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80"
];

function parsePrice(priceStr: any): number {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr || typeof priceStr !== 'string') return 0;
  const clean = priceStr.replace(/EGP/gi, '').replace(/\s+/g, '').trim();
  if (clean.toLowerCase().endsWith('m')) {
    return parseFloat(clean) * 1_000_000;
  }
  if (clean.toLowerCase().endsWith('k')) {
    return parseFloat(clean) * 1_000;
  }
  return parseFloat(clean) || 0;
}

function mapToClientListing(id: string, data: any) {
  const priceNum = parsePrice(data.price);
  const typeLower = (data.type || "Apartment").toLowerCase();
  let imgIndex = typeof data.img === 'number' ? data.img : 0;
  const image = ESTATE_IMAGES[imgIndex % ESTATE_IMAGES.length];

  return {
    id,
    title: data.title || `${data.type || "Property"} in ${data.cmp || "Sierra Estates"}`,
    titleAr: data.titleAr || (data.type === "Villa" ? `فيلا في ${data.cmp}` : `شقة في ${data.cmp}`),
    price: priceNum,
    compound: data.cmp || data.compound || "",
    beds: data.beds || data.bedrooms || 0,
    baths: data.baths || data.bathrooms || Math.max(1, (data.beds || 1) - 1),
    area: data.area || 0,
    image,
    images: [image],
    description: data.description || `Premium luxury ${typeLower} situated in the prestigious gated community of ${data.cmp || "Sierra Estates"}.`,
    propertyType: typeLower,
    status: data.status || "Active",
    amenities: data.amenities || ["24/7 Security", "Private Garden", "Parking", "Clubhouse"],
    purpose: data.purpose || "for-sale",
    pfReferenceNumber: data.pfReferenceNumber || null,
    ai_score: data.ai || data.ai_score || 9.0
  };
}

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
      res.json({ success: true, listing: mapToClientListing(docSnap.id, docSnap.data()) });
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
    const listings = snapshot.docs.map(doc => mapToClientListing(doc.id, doc.data()));
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

// ============================================================================
// ADMIN CONSOLE API ENDPOINTS
// ============================================================================

// GET auth verify
app.get("/api/admin/auth/verify", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.json({ authenticated: false, role: null, isAdmin: false });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Check users/{uid} document in Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    let role = userDoc.exists ? userDoc.data()?.role ?? null : null;

    // Bootstrap check: if it is the owner's email, auto-grant admin
    const bootstrappedEmails = [
      "A.fawzy8866@gmail.com", 
      "a.fawzy8866@gmail.com", 
      "emeraldestatesegypt@gmail.com"
    ];
    if (email && bootstrappedEmails.some(e => e.toLowerCase() === email.toLowerCase())) {
      role = "admin";
      // Auto-create or update the users/{uid} doc to persist it
      await db.collection("users").doc(uid).set({
        email,
        role: "admin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    const isAdmin = role === 'admin' || role === 'superadmin' || role === 'manager' || role === 'agent';

    res.json({
      authenticated: true,
      uid,
      email,
      role,
      isAdmin,
    });
  } catch (err: any) {
    console.error("Auth verification failed:", err);
    res.json({ authenticated: false, role: null, isAdmin: false, error: err.message });
  }
});

// Authentication middleware for /api/admin routes (excluding verify)
const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const userDoc = await db.collection("users").doc(uid).get();
    const role = userDoc.exists ? userDoc.data()?.role ?? null : null;
    
    const bootstrappedEmails = [
      "A.fawzy8866@gmail.com", 
      "a.fawzy8866@gmail.com", 
      "emeraldestatesegypt@gmail.com"
    ];
    const isBootstrapped = email && bootstrappedEmails.some(e => e.toLowerCase() === email.toLowerCase());
    
    if (role === 'admin' || role === 'superadmin' || role === 'manager' || role === 'agent' || isBootstrapped) {
      (req as any).user = decodedToken;
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Not an admin" });
    }
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Apply auth to all /api/admin routes except verify
app.use("/api/admin", (req, res, next) => {
  if (req.path === "/auth/verify") {
    return next();
  }
  authenticateAdmin(req, res, next);
});

// Generic Collection CRUD helper
const registerCrudRoutes = (routePath: string, collectionName: string) => {
  // GET all
  app.get(`/api/admin/${routePath}`, async (req, res) => {
    try {
      const snapshot = await db.collection(collectionName).get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({ success: true, [routePath]: items });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // POST create
  app.post(`/api/admin/${routePath}`, async (req, res) => {
    try {
      const docRef = await db.collection(collectionName).add({
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.status(201).json({ success: true, id: docRef.id });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // PATCH update
  app.patch(`/api/admin/${routePath}/:id`, async (req, res) => {
    try {
      await db.collection(collectionName).doc(req.params.id).set({
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // DELETE single
  app.delete(`/api/admin/${routePath}/:id`, async (req, res) => {
    try {
      await db.collection(collectionName).doc(req.params.id).delete();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });
};

// Register CRUD routes for all admin pages
registerCrudRoutes("leads", "leads");
registerCrudRoutes("listings", "listings");
registerCrudRoutes("agents", "agents");
registerCrudRoutes("workflows", "workflows");
registerCrudRoutes("pages", "pages");
registerCrudRoutes("followups", "followups");

// Special Bulk Leads route
app.post("/api/admin/leads/bulk", async (req, res) => {
  try {
    const { ids, action, patch } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, error: "Invalid or empty IDs list" });
      return;
    }

    const batch = db.batch();
    if (action === 'delete') {
      ids.forEach(id => {
        batch.delete(db.collection("leads").doc(id));
      });
    } else if (action === 'update' && patch) {
      ids.forEach(id => {
        batch.set(db.collection("leads").doc(id), {
          ...patch,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
    }

    await batch.commit();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special DB Editor routes
app.get("/api/admin/db/:collection", async (req, res) => {
  try {
    const snapshot = await db.collection(req.params.collection).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, docs });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/db/:collection", async (req, res) => {
  try {
    const docRef = await db.collection(req.params.collection).add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.patch("/api/admin/db/:collection/:id", async (req, res) => {
  try {
    await db.collection(req.params.collection).doc(req.params.id).set({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/admin/db/:collection/:id", async (req, res) => {
  try {
    await db.collection(req.params.collection).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special Team/Settings routes
app.get("/api/admin/team", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const team = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, team });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/team", async (req, res) => {
  try {
    const { email, role, uid } = req.body;
    if (!email || !role || !uid) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }
    await db.collection("users").doc(uid).set({
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.delete("/api/admin/team", async (req, res) => {
  try {
    const id = req.query.id as string;
    if (!id) {
      res.status(400).json({ success: false, error: "Missing user ID" });
      return;
    }
    await db.collection("users").doc(id).delete();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Special Bots Control routes
app.get("/api/admin/bots", async (req, res) => {
  try {
    const snapshot = await db.collection("bots").get();
    const bots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, bots });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.post("/api/admin/bots", async (req, res) => {
  try {
    const { botId, command } = req.body;
    await db.collection("bot_commands").add({
      botId,
      command,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: "pending"
    });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default app;
