import { Request } from 'express';
import type { AppResponse } from '@/apps/types/app.types';

export type AuthRequest = Request & {
  user: AppResponse;
};
