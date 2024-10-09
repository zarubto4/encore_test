import { request } from 'undici';

const headers = {
  Host: process.env.NEXT_DEAL_CATALOG_API_HOST,
  ...Object.fromEntries([process.env.NEXT_API_HEADERS?.split(':') ?? []]),
};
const baseUrl = process.env.NEXT_BASE_API_URL;
const clientId = process.env.NEXT_DEAL_CATALOG_API_CLIENT_ID;


export const dealCatalogClient = {
  assignVideo: async ({ dealId, id }: AssignVideoOptions): Promise<void> => {
    await request(`${baseUrl}/deal_catalog/v2/deals/${dealId}/videos/reels/${id}?clientId=${clientId}`, {
      method: 'PUT',
      headers,
    });
  },
  unassignVideo: async ({ dealId, id }: AssignVideoOptions): Promise<void> => {
    await request(`${baseUrl}/deal_catalog/v2/deals/${dealId}/videos/reels/${id}?clientId=${clientId}`, {
      method: 'DELETE',
      headers,
    });
  },
  get: async (dealId: string): Promise<DealCatalogDeal> => {
    const response = await request(`${baseUrl}/deal_catalog/v2/deals/${dealId}?clientId=${clientId}`, {
      method: 'GET',
      headers,
    });
    // @ts-expect-error TODO: Fix type of response.body.json()
    return (await response.body.json())?.deal;
  },
  getByPermalink: async (permalink: string): Promise<DealCatalogDeal> => {
    const slug = permalink.split('/').reverse().find(Boolean)?.split('?')[0];
    const response = await request(`${baseUrl}/deal_catalog/v2/permalinks/deal/${slug}?clientId=${clientId}`, {
      method: 'GET',
      headers,
    });
    // @ts-expect-error TODO: Fix type of response.body.json()
    return (await response.body.json())?.deal;
  },
};

type AssignVideoOptions = {
  dealId: string;
  id: string;
}

export type DealCatalogDeal = {
  id: string
  slug: string
  videos: {
    id: string
    source: string
    coverImageUrl: string | null
    updatedAt: string
  }[]
  creativeContents: {
    locale: string
    title: string
  }[]
}
