'use client';

import { useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

interface Photo {
  url: string;
  title?: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  open: boolean;
  index: number;
  onClose: () => void;
}

export function PhotoLightbox({ photos, open, index, onClose }: PhotoLightboxProps) {
  const slides = photos.map((p) => ({
    src: p.url || '/images/placeholder.jpg',
    title: p.title,
    description: p.title,
  }));

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div onContextMenu={handleContextMenu}>
      <Lightbox
        open={open}
        close={onClose}
        index={index}
        slides={slides}
        plugins={[Zoom, Thumbnails, Captions]}
        carousel={{ finite: false }}
        animation={{ fade: 300 }}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
        }}
        render={{
          slide: ({ slide }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={'src' in slide ? (slide.src as string) : ''}
              alt={'title' in slide ? (slide.title as string) || '' : ''}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                pointerEvents: 'auto',
              }}
            />
          ),
        }}
      />
    </div>
  );
}
