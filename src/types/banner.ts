import { Timestamp } from './common';

export interface BannerOffset {
  top?: number;    // inches, positive = down, negative = up
  left?: number;   // inches, positive = right, negative = left
}

export interface Banner {
  title: string;
  subtitle?: string;
  description: string;
  lang: 'en' | 'as';
  image: string;
  imageBlur?: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  titleOffset?: BannerOffset;
  descriptionOffset?: BannerOffset;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
