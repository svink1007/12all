import BaseService from './BaseService';
import { SharedStreamVlrs } from '../shared/types';

export interface VodItem {
  id: number;
  title: string;
  description: string;
  url: string;
  logo: string;
  genre: string;
  country: string | null;
  language: string;
  is_approved: boolean;
  owner_id: number;
  last_active: string | null;
  is_adult_content: boolean;
  show_till_android_version: string | null;
  duration: number;
  last_watch_date: string | null;
  country_of_origin: string | null;
  audioOnly: boolean | null;
  starsAmount: number;
  isPrivate: boolean;
  restrictions: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  shared_streams: any[];
  is_favorite: boolean;
}

export interface VodResponse {
  data: VodItem;
}

class VodService extends BaseService {

  static getAllVod(scope: string | null = "own") {
    return this.getWithAuth<VodItem[]>('/shared-vod?type=' + (scope !== null ?  scope : "all"));
  }

  static getFilteredVoD(params: string) {
    const vodUrl = `/shared-vod?${params}`;
    return this.getWithAuth<VodItem[]>(vodUrl);
  }

  static searchVod(query: string | null) {
    return this.getWithAuth<VodItem[]>('/shared-vod?name=' + query);
  }

  static saveVod(data: FormData) {
    return this.postWithAuth('/shared-vod', data);
  }

  static editVod(data: FormData, id: number) {
    return this.putWithAuth<VodItem>(`/shared-vod/${id}`, data);
  }

  static deleteVod(vodId: number) {
    return this.deleteWithAuth<{ status: string, message: string }>(`/shared-vod/${vodId}`);
  }

  static getVod(vodId: number) {
    return this.getWithAuth<VodItem>(`/shared-vod/${vodId}`);
  }

  static getVideoOnDemand(vodId: number) {
    return this.getWithAuth<VodItem>(`/shared-vod/${vodId}`);
  }

  // Helper method to get VOD data in SharedStreamVlrs format for compatibility
  static async getVideoOnDemandForStream(vodId: number): Promise<{ data: SharedStreamVlrs }> {
    try {
      const vodResponse = await this.getVideoOnDemand(vodId);
              // Transform VodItem to SharedStreamVlrs format
        const streamVlrs: SharedStreamVlrs = {
          id: vodResponse.data.id,
          name: vodResponse.data.title || `VOD ${vodId}`,
          url: vodResponse.data.url || "",
          genre: vodResponse.data.genre || "",
          country: vodResponse.data.country || "",
          language: vodResponse.data.language || "",
          logo: vodResponse.data.logo || null,
          premium_status: false,
          is_adult_content: vodResponse.data.is_adult_content || false,
          is_approved: vodResponse.data.is_approved || true,
          httpsPreviewHigh: vodResponse.data.logo || null,
          epg_channel: null,
          vlr: [],
          duration: vodResponse.data.duration || 0,
          starsAmount: vodResponse.data.starsAmount?.toString() || "0",
        };
      
      return { data: streamVlrs };
    } catch (error) {
      console.error('Error transforming VOD data:', error);
      // Return fallback data if transformation fails
      const fallbackData: SharedStreamVlrs = {
        id: vodId,
        name: `VOD ${vodId}`,
        url: "",
        genre: "",
        country: "",
        language: "",
        logo: null,
        premium_status: false,
        is_adult_content: false,
        is_approved: true,
        httpsPreviewHigh: null,
        epg_channel: null,
        vlr: [],
        starsAmount: "0",
        duration: 0,
      };
      return { data: fallbackData };
    }
  }
}

export default VodService;
