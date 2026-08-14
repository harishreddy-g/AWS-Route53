'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusMessage } from '@/components/ui/StatusMessage';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { getPostLoginRedirect } from '@/lib/auth/redirect';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-aws-gray">
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
  const redirectPath = getPostLoginRedirect(searchParams.get('next'));
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isLoading, redirectPath, router]);

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
      router.push(redirectPath);
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
      <div className="flex min-h-screen items-center justify-center bg-aws-gray">
        <LoadingState label="Checking session..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-aws-gray">
      <header className="flex h-10 items-center bg-aws-slate px-4 text-white">
        <span className="text-sm font-bold">aws</span>
        <span className="mx-2 text-slate-500">|</span>
        <span className="text-sm">Sign in</span>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-normal text-aws-text">Sign in to Route 53</h1>
            <p className="mt-1 text-sm text-aws-muted">AWS Management Console</p>
          </div>

          <div className="aws-panel p-6">
            {sessionExpired && (
              <div className="mb-4">
                <StatusMessage
                  title="Session expired"
                  message="Your session has expired. Please sign in again."
                  type="info"
                />
              </div>
            )}

            {success && (
              <div className="mb-4">
                <StatusMessage title="Login successful" message="Redirecting..." type="success" />
              </div>
            )}

            {serverError && (
              <div className="mb-4">
                <StatusMessage title="Login failed" message={serverError} type="error" />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                Sign in
              </Button>
            </form>

            <div className="mt-5 border-t border-aws-borderLight pt-4 text-center">
              <p className="text-xs text-aws-muted">
                Demo: <span className="font-mono">admin@example.com</span> /{' '}
                <span className="font-mono">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-aws-slate px-4 py-2 text-center text-[11px] text-slate-400">
        © 2026, Amazon Web Services, Inc. or its affiliates.
      </footer>
    </div>
  );
}
