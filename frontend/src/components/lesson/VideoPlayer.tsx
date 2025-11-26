'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  destroy: () => void;
}

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

function YouTubePlayer({
  videoId,
  initialPosition = 0,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
}: {
  videoId: string;
  initialPosition?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(initialPosition > 0);

  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        onTimeUpdate?.(time);
      }
    }, 1000);
  }, [onTimeUpdate]);

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const playerId = `youtube-player-${videoId}`;

    const initPlayer = () => {
      if (!containerRef.current || playerRef.current) return;

      const playerDiv = document.createElement('div');
      playerDiv.id = playerId;
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setIsReady(true);
          },
          onStateChange: (event) => {
            switch (event.data) {
              case window.YT.PlayerState.PLAYING:
                startTimeTracking();
                onPlay?.();
                break;
              case window.YT.PlayerState.PAUSED:
                stopTimeTracking();
                onPause?.();
                break;
              case window.YT.PlayerState.ENDED:
                stopTimeTracking();
                onEnded?.();
                break;
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, onPlay, onPause, onEnded, startTimeTracking, stopTimeTracking]);

  const handleResumeFromPosition = () => {
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(initialPosition, true);
      playerRef.current.playVideo();
      setShowResumePrompt(false);
    }
  };

  const handleStartFromBeginning = () => {
    if (playerRef.current && isReady) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      setShowResumePrompt(false);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {showResumePrompt && initialPosition > 0 && isReady && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
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
    return (
      <YouTubePlayer
        videoId={youtubeId}
        initialPosition={initialPosition}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      />
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
