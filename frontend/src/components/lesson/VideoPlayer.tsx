'use client';

import { useRef, useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  contentUrl: string;
  initialPosition?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPlayer({
  contentUrl,
  initialPosition = 0,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(initialPosition > 0);
  const [hasStarted, setHasStarted] = useState(false);
  const youtubeId = getYouTubeVideoId(contentUrl);

  useEffect(() => {
    if (videoRef.current && initialPosition > 0 && !hasStarted) {
      setShowResumePrompt(true);
    }
  }, [initialPosition, hasStarted]);

  const handleResumeFromPosition = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = initialPosition;
      videoRef.current.play();
      setHasStarted(true);
      setShowResumePrompt(false);
    }
  };

  const handleStartFromBeginning = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setHasStarted(true);
      setShowResumePrompt(false);
    }
  };

  const handlePlay = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setShowResumePrompt(false);
    }
    onPlay?.();
  };

  if (youtubeId) {
    const startParam = initialPosition > 0 ? `&start=${Math.floor(initialPosition)}` : '';
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0${startParam}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {initialPosition > 0 && !hasStarted && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              上次觀看到 {formatTime(initialPosition)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
        onPlay={handlePlay}
        onPause={onPause}
        onEnded={onEnded}
      >
        <source src={contentUrl} />
        Your browser does not support the video tag.
      </video>

      {showResumePrompt && initialPosition > 0 && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-card rounded-lg p-6 max-w-sm mx-4 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              上次觀看到 {formatTime(initialPosition)}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleStartFromBeginning}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium',
                  'bg-muted hover:bg-muted/80 transition-colors'
                )}
              >
                從頭開始
              </button>
              <button
                onClick={handleResumeFromPosition}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2',
                  'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                )}
              >
                <Play className="h-4 w-4" />
                繼續觀看
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
