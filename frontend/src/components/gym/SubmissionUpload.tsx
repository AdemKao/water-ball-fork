'use client';

import { useState, useRef } from 'react';
import { useSubmission } from '@/hooks/useSubmission';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Upload, FileUp, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubmissionType, SUBMISSION_TYPE_CONFIG } from '@/types/gym';

interface SubmissionUploadProps {
  problemId: string;
  submissionTypes: SubmissionType[];
  onSuccess?: () => void;
}

export function SubmissionUpload({ problemId, submissionTypes, onSuccess }: SubmissionUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { submit, isSubmitting, error } = useSubmission(problemId);

  const acceptedTypes = submissionTypes.flatMap(type => SUBMISSION_TYPE_CONFIG[type].accept);
  const maxSizeMB = Math.max(...submissionTypes.map(type => SUBMISSION_TYPE_CONFIG[type].maxSizeMB));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      await submit(file, isPublic);
      setSuccess(true);
      setFile(null);
      setIsPublic(false);
      onSuccess?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // Error is handled by hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          提交作業
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragActive && 'border-primary bg-primary/5',
            !dragActive && 'border-muted-foreground/25 hover:border-primary/50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept={acceptedTypes.join(',')}
          />
          <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          {file ? (
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium">拖放文件到此處或點擊選擇</p>
              <p className="text-sm text-muted-foreground">
                支援 {submissionTypes.map(t => SUBMISSION_TYPE_CONFIG[t].label).join('、')} (最大 {maxSizeMB}MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error.message}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>提交成功！</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPublic"
            checked={isPublic}
            onCheckedChange={(checked) => setIsPublic(checked === true)}
          />
          <Label htmlFor="isPublic" className="text-sm cursor-pointer">
            公開我的批改結果給其他學員參考
          </Label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!file || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              提交中...
            </>
          ) : (
            '提交作業'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
