// src/types/index.d.ts
import { User } from "../interfaces/User";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}

export {};
