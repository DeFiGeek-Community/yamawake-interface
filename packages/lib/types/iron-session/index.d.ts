import type { IronSession } from "iron-session";
import type { SiweMessage } from "siwe";

declare module "iron-session" {
  interface IronSessionData {
    nonce?: string;
    siwe?: SiweMessage;
    expiresAt?: number;
  }
}

export type YamawakeSessionData = {
  nonce?: string;
  siwe?: SiweMessage;
  expiresAt?: number;
};

export type YamawakeSession = IronSession<YamawakeSessionData>;
