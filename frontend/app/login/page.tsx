'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <LoadingState label="Loading..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
      router.push('/dashboard');
    } catch (error) {
      setServerError(getErrorMessage(error, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <LoadingState label="Checking session..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-aws-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-aws-orange rounded-lg p-2.5">
              <div className="text-white font-bold text-xl">R53</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Route53 Clone</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-panel p-8">
          {sessionExpired && (
            <div className="mb-6">
              <StatusMessage
                title="Session expired"
                message="Your session has expired. Please sign in again."
                type="info"
              />
            </div>
          )}

          {success && (
            <div className="mb-6">
              <StatusMessage title="Login successful" message="Redirecting to dashboard..." type="success" />
            </div>
          )}

          {serverError && (
            <div className="mb-6">
              <StatusMessage title="Login failed" message={serverError} type="error" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email address"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => handleInputChange('email', event.target.value)}
              error={errors.email}
              disabled={loading || success}
              autoComplete="email"
              autoFocus
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => handleInputChange('password', event.target.value)}
              error={errors.password}
              disabled={loading || success}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" loading={loading} disabled={success}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Demo credentials:{' '}
              <span className="font-mono bg-slate-50 px-2 py-1 rounded text-slate-700">admin@example.com</span> /{' '}
              <span className="font-mono bg-slate-50 px-2 py-1 rounded text-slate-700">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
