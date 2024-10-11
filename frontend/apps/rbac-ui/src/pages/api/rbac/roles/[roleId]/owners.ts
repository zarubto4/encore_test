import { RbacApiClientHandler, withRbacApiClient } from '@/clients/rbac';
import { resolveMyUserIdForRegion, resolveUserByEmailForRegion } from '@/lib/user';
import { handleError } from 'libs/stdlib/src';
import { UserRegionType } from 'libs/users-client/src';

const handler: RbacApiClientHandler = async (req, res, rbac) => {
  const roleId = req.query.roleId as string;
  if (!roleId) {
    res.status(400).json({ message: 'Role ID is required' });
    return;
  }

  if (req.method === 'POST') {
    const { emails, regions }: { emails: string[], regions: UserRegionType[] } = req.body;
    if (!emails.length || !regions?.length) {
      return res.status(400).json({ message: 'emails and regions are required' });
    }

    const usersPerRegion = await Promise.all(
      regions.map(async (region) => {
        return await Promise.all(
          emails.map(async (email) => {
            try {
              return {
                email,
                ...(await resolveUserByEmailForRegion(email, region, req)),
              };
            } catch (error) {
              return { email, region, user: null, error: handleError(error) };
            }
          }),
        );
      }),
    );

    const allUsers = usersPerRegion.flat();

    const result = allUsers.reduce(
      (acc, { email, user, region }) => {
        if (!user) {
          acc.failed.push({ email, region: region as UserRegionType, error: 'User not found' });
        } else {
          acc.success.push({ email, userId: user.id, region: region as UserRegionType });
        }
        return acc;
      },
      { success: [], failed: [] } as {
        success: { email: string; userId: string; region: UserRegionType }[];
        failed: { email: string; region: UserRegionType, error: string }[];
      },
    );

    const finalResult = { success: [], failed: [...result.failed] } as {
      success: { email: string; userId: string; region: UserRegionType }[];
      failed: { email: string; region: UserRegionType; error: string }[];
    };

    await Promise.all(
      result.success.map(async ({ userId, email, region }) => {
        try {
          rbac.setUserId(resolveMyUserIdForRegion(req, region));
          await rbac.api.v2.rolesOwnersCreate({
            roleId,
            ownerId: userId,
            comments: '',
            region,
          })
          finalResult.success.push({ email, userId, region });
        } catch (error) {
          crit({ req, error: handleError(error), status: 500 });
          finalResult.failed.push({ email, region, error: handleError(error) });
        }
      }),
    );

    res.status(200).json(finalResult);
    return;
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).json({ message: `Method ${req.method} Not Allowed` });
};

export default withRbacApiClient(handler);
