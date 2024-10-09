import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';
import { UgcClient } from '@/server/ugc-client';
import { dealCatalogClient } from '@/server/deal-catalog-client';
import { uniq } from 'lodash-es';

const AssociateStorySchema = z.object({
  id: z.string(),
  dealId: z.string(),
});
const DeleteStorySchema = z.object({
  id: z.string(),
});
const FindStoriesSchema = z.object({
  permalink: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});
const GetStorySchema = z.object({ id: z.string() });

export const storiesRouter = createTRPCRouter({
  delete: publicProcedure
    .input(DeleteStorySchema)
    .mutation(async ({ input, ctx }): Promise<void> => {
      const ugcClient = new UgcClient(ctx.user.id);
      const video = await ugcClient.video.get(input.id);
      if (video.dealId) {
        await dealCatalogClient.unassignVideo({ id: input.id, dealId: video.dealId });
      }
      await ugcClient.video.delete(input.id);
    }),
  search: publicProcedure
    .input(FindStoriesSchema)
    .query(async ({ input, ctx }): Promise<Stories> => {
      const videos = await new UgcClient(ctx.user.id).video.search(input);
      const dealIds = uniq(videos.video.filter(v => v.dealId).map(v => v.dealId as string));
      const deals = await Promise.allSettled(dealIds.map(dealId => dealCatalogClient.get(dealId)));
      const settledDeals = deals.map(deal => deal.status === 'fulfilled' ? deal.value : null);

      return {
        stories: videos.video.map((video) => {
          const deal = settledDeals.find(deal => deal?.id === video.dealId);
          return ({
            id: video.id,
            title: deal?.creativeContents.find(({ locale }) => locale === 'en')?.title ?? '',
            createdAt: video.createdAt,
            videoUrl: video.videoUrl!,
            dealId: video.dealId,
            error: video.error,
            status: video.status,
            coverImageUrls: video.coverImageUrls,
            isInDealGallery: deal?.videos.some(({ id }) => id === video.id) ?? false,
          });
        }),
        offset: videos.offset,
        limit: videos.limit,
        total: videos.total,
      };
    }),
  get: publicProcedure
    .input(GetStorySchema)
    .query(async ({ input, ctx }): Promise<Story> => {
      const video = await new UgcClient(ctx.user.id).video.get(input.id);

      let isInDealGallery = false;
      let title = '';
      if (video.dealId) {
        const deal = await dealCatalogClient.get(video.dealId);
        isInDealGallery = deal.videos.some(({ id }) => id === video.id);
        title = deal.creativeContents.find(({ locale }) => locale === 'en')?.title ?? '';
      }

      return {
        id: video.id,
        title,
        createdAt: video.createdAt,
        videoUrl: video.videoUrl!,
        dealId: video.dealId,
        isInDealGallery,
        error: video.error,
        status: video.status,
        coverImageUrls: video.coverImageUrls,
      };
    }),
  assign: publicProcedure
    .input(AssociateStorySchema)
    .mutation(async ({ input }): Promise<void> => {
      await dealCatalogClient.assignVideo(input);
    }),
  unassign: publicProcedure
    .input(AssociateStorySchema)
    .mutation(async ({ input }): Promise<void> => {
      await dealCatalogClient.unassignVideo(input);
    }),
});


export interface Story {
  title: string | null;
  createdAt: string;
  videoUrl: string;
  id: string;
  dealId: string | null;
  isInDealGallery: boolean;
  error: string | null;
  status: 'new' | 'uploaded' | 'deleted' | 'failed';
  coverImageUrls: string[] | null;
}

export type Stories = {
  stories: Story[];
  offset: number;
  limit: number;
  total: number;
}

