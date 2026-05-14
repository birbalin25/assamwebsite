import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = require('/tmp/firebase-admin-key.json');

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

async function setupAdmin() {
  const email = 'birbal.in@gmail.com';
  const password = 'Assam@Dallas2026';

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
    console.log('Password:', password);
  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

setupAdmin();
