'use client';

import { useState, useRef, useEffect } from 'react';
import { Film } from 'lucide-react';

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

interface VideoThumbnailProps {
  url: string;
  className?: string;
}

export function VideoThumbnail({ url, className = 'w-24 h-16' }: VideoThumbnailProps) {
  const [vimeoThumb, setVimeoThumb] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ytId = getYouTubeId(url);
  const vimeoId = getVimeoId(url);

  useEffect(() => {
    if (vimeoId) {
      fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`)
        .then(res => res.json())
        .then(data => {
          if (data?.[0]?.thumbnail_medium) {
            setVimeoThumb(data[0].thumbnail_medium);
          }
        })
        .catch(() => {});
    }
  }, [vimeoId]);

  // YouTube thumbnail
  if (ytId) {
    return (
      <div className={`${className} rounded overflow-hidden bg-earth-900 shrink-0`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Vimeo thumbnail
  if (vimeoId) {
    return (
      <div className={`${className} rounded overflow-hidden bg-earth-900 shrink-0 flex items-center justify-center`}>
        {vimeoThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vimeoThumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <Film className="h-5 w-5 text-earth-400" />
        )}
      </div>
    );
  }

  // Direct video file — show first frame preview
  return (
    <div className={`${className} rounded overflow-hidden bg-earth-900 shrink-0 flex items-center justify-center`}>
      <video
        ref={videoRef}
        src={url}
        muted
        preload="metadata"
        className={`w-full h-full object-cover ${videoLoaded ? '' : 'hidden'}`}
        onLoadedData={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 1;
            setVideoLoaded(true);
          }
        }}
      />
      {!videoLoaded && <Film className="h-5 w-5 text-earth-400" />}
    </div>
  );
}
