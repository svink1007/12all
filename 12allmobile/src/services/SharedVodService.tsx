import BaseService from "./BaseService";
import axios from "axios";
import { API_URL } from "../shared/constants";

export interface SharedVodItem {
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

export interface SharedVodResponse {
  data: SharedVodItem[];
}

// The API returns an array directly, not wrapped in a data property
export type SharedVodApiResponse = SharedVodItem[];

class SharedVodService extends BaseService {
  static async getSharedVod(
    type: string = "all"
  ): Promise<{ data: SharedVodApiResponse }> {
    const jwtToken = BaseService.getJwtToken();
    const config = jwtToken
      ? {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      : {};

    return axios.get<SharedVodApiResponse>(
      `https://wp.12all.tv:1359/shared-vod?type=${type}`,
      config
    );
  }
}

export default SharedVodService;
