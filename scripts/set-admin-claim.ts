import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/set-admin-claim.ts <email>');
  console.error('Example: npx tsx scripts/set-admin-claim.ts admin@example.com');
  process.exit(1);
}

const serviceAccount = require('/tmp/firebase-admin-key.json');

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

async function setAdminClaim() {
  try {
    const user = await auth.getUserByEmail(email);
    console.log('Found user:', user.uid);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('Admin claim set successfully!');
    console.log('\nYou can now log in at /admin/login with:');
    console.log('Email:', email);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

setAdminClaim();
