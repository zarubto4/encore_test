import { request } from 'undici';
import { NextRequest, NextResponse } from 'next/server';
import { UgcClient } from '@/server/ugc-client';
import { dealCatalogClient } from '@/server/deal-catalog-client';

export async function POST(req: NextRequest, res: NextResponse) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const userId = req.headers.get('x-grpn-user-id')!; // Inserted by middleware
  const ugcClient = new UgcClient(userId);
  try {
    const formData = await req.formData();
    const file = formData.get('File') as File;
    const dealPermalink = formData.get('dealPermalink') as string;
    const deal = await dealCatalogClient.getByPermalink(dealPermalink);
    if (!deal?.id) {
      return Response.json({ message: `Deal with permalink "${dealPermalink}" does not exist.` }, { status: 400 });
    }
    const videoItem = await ugcClient.video.create(deal.id);
    if (!videoItem) {
      return Response.json({ message: 'Failed to create the story in UGC.' }, { status: 500 });
    }
    await request(videoItem.url, {
      method: 'PUT', // Usually, presigned URLs for file uploads use PUT
      headers: {
        'Content-Type': file.type, // Set the content type of the file
        'Content-Length': file.size.toString(), // Set the content length of the file
      },
      // @ts-expect-error TODO: fix this type
      body: file.stream(), // Stream the file content directly to the S3
    });
    await ugcClient.video.edit({
      id: videoItem.id,
      updatedBy: userId,
      fileName: file.name,
      permalink: deal.slug,
    });
    return Response.json(videoItem);
  } catch (error: any) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
