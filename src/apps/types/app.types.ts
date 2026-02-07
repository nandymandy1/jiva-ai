export type AppResponse = {
  _id: string;
  name: string;
  clientId: string;
  clientSecret?: string; // Only returned on registration
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
