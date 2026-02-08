export type UserRole = {
  id: string;
  name: string;
};

export type UserResponse = {
  userId: string;
  email: string;
  username: string;
  permissions: string[];
  tenantId: string;
  roles: UserRole[];
};
