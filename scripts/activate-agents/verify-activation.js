const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");

const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = getFirestore();

async function verify() {
  const snap = await db.collection("agents").get();
  console.log("\nVerified Agent Statuses in Firestore:");
  snap.forEach(doc => {
    const data = doc.data();
    console.log(` - ${doc.id} (${data.name || 'unnamed'}): status = "${data.status}", activatedAt = ${data.activatedAt ? data.activatedAt.toDate().toISOString() : 'N/A'}`);
  });
}

verify().catch(console.error);
