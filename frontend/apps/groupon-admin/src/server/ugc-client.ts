import { request } from 'undici';

const headers = {
  Host: process.env.NEXT_UGC_API_HOST,
  ...Object.fromEntries([process.env.NEXT_API_HEADERS?.split(':') ?? []]),
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
const baseUrl = process.env.NEXT_BASE_API_URL;

type UGCEditVideo = {
  id: string;
  updatedBy: string;
  dealId?: string;
  permalink?: string;
  fileName?: string;
  merchantId?: string;
}
type UGCSearchVideo = {
  /** UUID, used to filter by merchant id */
  merchantId?: string;
  /** UUID, used to filter by deal id */
  dealId?: string;
  /** Deal permalink to filter by */
  permalink?: string;
  /** Comma separated video ids to filter by */
  ids?: string;
  /** UUID, used to filter by user id */
  userId?: string;
  /** Limit the number of results, default value: 20 */
  limit?: number;
  /** Offset for pagination, default value: 0 */
  offset?: number;
  /** Field to order results by, available values: 'date', 'date_asc', default value: 'time' */
  orderBy?: string;
  /** Start date to filter by (ISO 8601 date-time format) */
  startDate?: string;
  /** End date to filter by (ISO 8601 date-time format) */
  endDate?: string;
};

type UGCVideo = {
  id: string
  url: string
  status: 'new' | 'uploaded' | 'deleted' | 'failed'
}

export class UgcClient {
  constructor(private userId: string) {
  }

  video = {
    create: async (dealId: string): Promise<UGCVideo | null> => {
      const response = await request(`${baseUrl}/v1.0/influencer/video/presinged-urls/${this.userId}?deal-id=${dealId}`, {
        method: 'POST',
        headers,
      });
      const videos = (await response.body.json()) as (UGCVideo[] | { errors: string[] });

      if (response.statusCode !== 200 || Object.hasOwn(videos, 'errors')) {
        // @ts-expect-error Checked the property above
        throw new Error(videos?.errors?.[0]);
      }
      return Array.isArray(videos) ? videos[0] : null;
    },
    edit: async ({
                   id,
                   dealId,
                   merchantId,
                   permalink,
                   fileName,
                 }: UGCEditVideo) => {
      const updateObject = Object.fromEntries(Object.entries({
        dealId,
        updatedBy: this.userId,
        permalink,
        fileName,
        merchantId,
      }).filter(([_, value]) => value));
      const response = await request(baseUrl + `/v1.0/influencer/video/${id}`, {
        body: JSON.stringify(updateObject),
        method: 'PUT',
        headers,
      });
      return response.body.json();
    },
    delete: async (id: string): Promise<UGCVideo> => {
      const response = await request(baseUrl + `/v1.0/influencer/video/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          'action': 'delete',
          'updatedBy': this.userId,
        }),
      });

      const videos = (await response.body.json()) as UGCVideo[];
      return videos[0];
    },
    search: async (query: UGCSearchVideo): Promise<UGCSearchVideoResponse> => {
      const urlSearchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) {
          if (key === 'permalink' && typeof value === 'string') {
            const slug = value.split('/').reverse().find(Boolean)?.split('?')[0];
            if (slug) {
              urlSearchParams.set(key, slug);
              return;
            }
          }
          urlSearchParams.set(key, value.toString());
        }
      });
      const response = await request(baseUrl + '/v1.0/influencer/video/search?' + urlSearchParams.toString(), {
        method: 'GET',
        headers,
      });
      const videos = await response.body.json() as UGCSearchVideoResponse;
      return videos;
    },
    get: async (id: string): Promise<UGCVideoResponse> => {
      const response = await request(baseUrl + '/v1.0/influencer/video/' + id, {
        method: 'GET',
        headers,
      });
      const video = await response.body.json() as UGCVideoResponse;
      return video;
    },
  };
};

type UGCVideoResponse = {
  id: string
  userId: string
  userType: string
  merchantId: string | null
  dealId: string | null
  permalink: string | null
  videoUrl: string | null
  error: string | null
  createdAt: string
  updatedAt: string
  status: 'new' | 'uploaded' | 'deleted' | 'failed'
  fileName: string | null
  contentType: string | null
  fileSize: number
  duration: number
  updatedBy: string | null
  coverImageUrls: string[]
}

type UGCSearchVideoResponse = {
  offset: number;
  limit: number;
  total: number;
  video: UGCVideoResponse[]
}
