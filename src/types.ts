import React from 'react';

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface SocialMediaPost {
  platform: 'VK' | 'Telegram' | 'Instagram' | 'TikTok';
  type: 'Full Publication' | 'Post' | 'Reels Caption' | 'Shorts Caption' | 'TikTok Caption';
  text: string;
}

export interface GeneratedContent {
  youtubeTitle: string[];
  youtubeDescription: string;
  youtubeTags: string[];
  socialMediaPosts: SocialMediaPost[];
  ingredients: Ingredient[];
  instructions: string[];
  thumbnailDescription: string;
  thumbnailImageUrl?: string;
  optimalPublishingSchedule?: string;
  promotionTips?: string;
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'red';

export interface PageConfig {
  name: string;
  component: React.ComponentType;
}

