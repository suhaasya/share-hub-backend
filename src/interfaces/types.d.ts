export interface CustomResponse {
  data: unknown;
  error: unknown;
  message: string;
}

export interface JwtPayload {
  id: number;
  email: string;
}

export type RequestContext = {
  auth?: JwtPayload;
};
