'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  title?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  autoplay?: boolean;
}

export function MediaCarousel({ items, autoplay = true }: MediaCarouselProps) {
  if (items.length === 0) return null;

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={16}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      className="w-full"
    >
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="aspect-video bg-gradient-to-br from-earth-100 to-earth-200 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-earth-400 text-sm">{item.title || 'Media'}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
