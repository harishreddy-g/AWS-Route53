'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusMessage } from '@/components/ui/StatusMessage';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - API integration will be added later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo: accept mock credentials
      if (email === 'admin@example.com' && password === 'password') {
        setSuccess(true);
        setTimeout(() => {
          // Later: redirect to dashboard
          // router.push('/dashboard');
        }, 1000);
      } else {
        setServerError('Invalid email or password');
      }
    } catch (error) {
      setServerError('An error occurred. Please try again.');
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
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-aws-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-aws-orange rounded-lg p-2.5">
              <div className="text-white font-bold text-xl">R53</div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Route53 Clone</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        {/* Login form card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-panel p-8">
          {success && (
            <div className="mb-6 animate-in fade-in">
              <StatusMessage title="Login successful" message="Redirecting to dashboard..." type="success" />
            </div>
          )}

          {serverError && (
            <div className="mb-6 animate-in fade-in">
              <StatusMessage title="Login failed" message={serverError} type="error" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email address"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
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
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              disabled={loading || success}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" loading={loading} disabled={success}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Helper text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Demo credentials:{' '}
              <span className="font-mono bg-slate-50 px-2 py-1 rounded text-slate-700">admin@example.com</span> /{' '}
              <span className="font-mono bg-slate-50 px-2 py-1 rounded text-slate-700">password</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <p>
            © 2026 Route53 Clone. This is a learning project.{' '}
            <a href="#" className="text-aws-orange hover:text-aws-orangeDark">
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
