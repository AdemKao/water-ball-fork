import Link from 'next/link';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccessDeniedModalProps {
  journeyId: string;
  journeyTitle?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccessDeniedModal({
  journeyId,
  open = true,
  onOpenChange,
}: AccessDeniedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-yellow-500" />
          </div>
          <DialogTitle>需要購買才能觀看</DialogTitle>
          <DialogDescription>
            此課程內容需要購買後才能觀看完整內容
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-3">
          <Link href={`/courses/${journeyId}`}>
            <Button variant="outline">返回課程</Button>
          </Link>
          <Button>立即購買</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LoginRequiredModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function LoginRequiredModal({
  open = true,
  onOpenChange,
  onClose,
}: LoginRequiredModalProps) {
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
    if (!isOpen) onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="text-center sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="items-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>請先登入</DialogTitle>
          <DialogDescription>
            登入後即可觀看試聽課程內容
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-3">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Link href="/login">
            <Button>前往登入</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
