'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { SiteLogo } from '@/components/shared/SiteLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        toast.error('Firebase is not configured. Add credentials to .env.local');
        setLoading(false);
        return;
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdTokenResult();
      if (!token.claims.admin) {
        toast.error('You do not have admin access.');
        await auth.signOut();
        return;
      }
      router.push('/admin');
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex justify-center">
            <SiteLogo size="xl" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-earth-800">Admin Login</h1>
          <p className="text-earth-500 text-sm mt-1">Assamese Community USA</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-xl border border-earth-200 shadow-sm p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <Button type="submit" isLoading={loading} className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
