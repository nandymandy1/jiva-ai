export type LoginResponse = {
  accessToken: string;
  expiresIn: number;
};

export type JwtPayload = {
  sub: string; // clientId
  name: string;
};
