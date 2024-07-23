import { Request } from "express";

export interface JwtPayload {
  id: number;
  email: string;
}

export type RequestContext = {
  auth?: JwtPayload;
};

export type CustomRequest = Request & { context: RequestContext };
