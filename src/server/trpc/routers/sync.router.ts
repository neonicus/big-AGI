import { TRPCError } from '@trpc/server';
import * as z from 'zod/v4';

import { createTRPCRouter, publicProcedure } from '../trpc.server';
import { prismaDb } from '~/server/prisma/prismaDb';

export const syncRouter = createTRPCRouter({

  /**
   * Loads the synchronized state for the current authenticated user.
   */
  loadState: publicProcedure
    .query(async ({ ctx }) => {
      const { userId } = ctx;
      if (userId === 'anonymous')
        return null;

      try {
        const record = await prismaDb.userSync.findUnique({
          where: { userId },
        });
        return record ? (record.syncData as any) : null;
      } catch (error: any) {
        console.error('Failed to load sync state:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to load sync state from database.',
        });
      }
    }),

  /**
   * Saves the synchronized state for the current authenticated user.
   */
  saveState: publicProcedure
    .input(z.object({
      syncData: z.any(),
      version: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      if (userId === 'anonymous') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to sync your data to the cloud.',
        });
      }

      const { syncData, version } = input;

      try {
        await prismaDb.userSync.upsert({
          where: { userId },
          update: {
            syncData,
            version: version ?? 1,
          },
          create: {
            userId,
            syncData,
            version: version ?? 1,
          },
        });
        return { success: true };
      } catch (error: any) {
        console.error('Failed to save sync state:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save sync state to database.',
        });
      }
    }),

});
