import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = require('/tmp/firebase-admin-key.json');

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

async function setAdminClaim() {
  try {
    const user = await auth.getUserByEmail('birbal.in@gmail.com');
    console.log('Found user:', user.uid);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('Admin claim set successfully!');
    console.log('\nYou can now log in at /admin/login with:');
    console.log('Email: birbal.in@gmail.com');
    console.log('Password: Assam@Dallas2026');
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

setAdminClaim();
