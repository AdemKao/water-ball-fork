'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorDisplay({
  title = '發生錯誤',
  message = '無法載入內容，請稍後再試',
  onRetry,
  showRetry = true,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          重試
        </Button>
      )}
    </div>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorDisplay
      title="網路連線錯誤"
      message="請檢查您的網路連線後重試"
      onRetry={onRetry}
    />
  );
}

interface NotFoundErrorProps {
  resourceName?: string;
  onBack?: () => void;
}

export function NotFoundError({ resourceName = '頁面', onBack }: NotFoundErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl font-bold text-muted-foreground/30 mb-4">404</div>
      <h3 className="text-lg font-semibold mb-2">{resourceName}不存在</h3>
      <p className="text-muted-foreground mb-6">
        找不到您要查看的{resourceName}
      </p>
      {onBack && (
        <Button onClick={onBack} variant="outline">
          返回
        </Button>
      )}
    </div>
  );
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  useEffect(() => {
    console.error('Error boundary caught error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">發生錯誤</h2>
        <p className="text-muted-foreground mb-6">
          應用程式發生錯誤，請重新載入頁面
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            重試
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            返回首頁
          </Button>
        </div>
      </div>
    </div>
  );
}
