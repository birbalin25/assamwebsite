import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: npx tsx scripts/setup-admin.ts <email> <password>');
  console.error('Example: npx tsx scripts/setup-admin.ts admin@example.com MySecurePass123');
  process.exit(1);
}

const serviceAccount = require('/tmp/firebase-admin-key.json');

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

async function setupAdmin() {
  try {
    // Try to get existing user
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log('User already exists:', user.uid);
    } catch {
      // Create new user
      user = await auth.createUser({
        email,
        password,
        displayName: 'Admin',
      });
      console.log('Created user:', user.uid);
    }

    // Set admin custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('Set admin claim for:', email);
    console.log('\nAdmin setup complete!');
    console.log('Login at: /admin/login');
    console.log('Email:', email);
  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

setupAdmin();
