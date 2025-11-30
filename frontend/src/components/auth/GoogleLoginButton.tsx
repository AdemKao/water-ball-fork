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
    <div 
      className="flex w-full flex-col items-center gap-2 [&_.nsm7Bb-HzV7m-LgbsSe]:!w-full [&_.nsm7Bb-HzV7m-LgbsSe]:!max-w-full [&_.nsm7Bb-HzV7m-LgbsSe]:!rounded-lg [&_.nsm7Bb-HzV7m-LgbsSe]:!py-3.5 [&_.nsm7Bb-HzV7m-LgbsSe]:!h-auto [&_.S9gUrf-YoZ4jf]:!w-full [&>div]:!w-full [&>div>div]:!h-auto" 
      data-slot="google-login"
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        size="large"
        width="400"
        text="signin_with"
        shape="rectangular"
        logo_alignment="center"
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
