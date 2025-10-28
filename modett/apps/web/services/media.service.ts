import { api } from '../lib/fetcher';
import { API_ENDPOINTS } from '../lib/config';
import type { ApiResponse } from '../types';

export interface MediaAsset {
  id: { value: string } | string;
  storageKey: string;
  mime: string;
  width?: number;
  height?: number;
  bytes?: number;
  altText?: string;
  focalX?: number;
  focalY?: number;
  renditions?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  version: number;
  createdAt: string;
}

/**
 * Fetch all media assets from the API
 */
async function getAllMedia(): Promise<MediaAsset[]> {
  try {
    const response = await api.get<ApiResponse<MediaAsset[]>>(
      `${API_ENDPOINTS.mediaAssets}?limit=100`
    );
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch media assets:', error);
    return [];
  }
}

/**
 * Create a map of product slug to image URL
 */
export async function getProductImageMap(): Promise<Record<string, string>> {
  const media = await getAllMedia();
  const imageMap: Record<string, string> = {};

  // Map media to products based on altText
  media.forEach((asset) => {
    const altText = asset.altText?.toLowerCase() || '';

    // Match by product keywords in altText
    if (altText.includes('silk shirt')) {
      imageMap['crispy-silk-shirt'] = asset.renditions?.large || asset.storageKey;
    } else if (altText.includes('wide-leg') && altText.includes('trousers')) {
      imageMap['wide-leg-silk-trousers'] = asset.renditions?.large || asset.storageKey;
    } else if (altText.includes('blazer')) {
      imageMap['tailored-wool-blazer'] = asset.renditions?.large || asset.storageKey;
    } else if (altText.includes('maxi dress') || (altText.includes('linen') && altText.includes('dress'))) {
      imageMap['linen-maxi-dress'] = asset.renditions?.large || asset.storageKey;
    } else if (altText.includes('relaxed') && altText.includes('trousers')) {
      imageMap['relaxed-linen-trousers'] = asset.renditions?.large || asset.storageKey;
    } else if (altText.includes('pleated') && altText.includes('skirt')) {
      imageMap['pleated-midi-skirt'] = asset.renditions?.large || asset.storageKey;
    }
  });

  return imageMap;
}

export const mediaService = {
  getAllMedia,
  getProductImageMap,
};
