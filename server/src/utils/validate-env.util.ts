import { env } from "../config/env.config";

export function validateEnv() {
  if (!env.PORT) {
    throw new Error("PORT is not found in the env");
  }
}