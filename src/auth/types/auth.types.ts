export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
};

export type JwtPayload = {
  sub: string; // _id
  name: string;
  clientId: string;
};
