'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GoogleLoginButtonProps {
  redirectUrl?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function GoogleLoginButton({ redirectUrl = '/', onSuccess, onError }: GoogleLoginButtonProps) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('No credential received');
      onError?.(new Error('No credential received'));
      return;
    }

    try {
      await loginWithGoogle(response.credential);
      onSuccess?.();
      router.push(redirectUrl);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
    }
  };

  const handleError = () => {
    const error = new Error('Google login failed');
    setError(error.message);
    onError?.(error);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        width="300"
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
