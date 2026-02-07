export type BaseResponse = {
  success: boolean;
  message?: string;
};

export type BaseDataResponse<T> = BaseResponse & {
  data: T;
};
