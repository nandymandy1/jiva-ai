export type AppResponse = {
  name: string;
  clientId: string;
  clientSecret?: string; // Only returned on registration
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
