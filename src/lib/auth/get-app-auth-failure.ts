import "server-only";

import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";

/** Collapses `Error.cause` chains for logging / string heuristics (bundlers may not preserve `instanceof`). */
export function messageFromUnknownError(err: unknown): string {
  const parts: string[] = [];
  let e: unknown = err;
  for (let depth = 0; e && depth < 6; depth++) {
    if (e instanceof Error) {
      parts.push(`${e.name}: ${e.message}`);
      e = e.cause;
    } else if (typeof e === "string") {
      parts.push(e);
      break;
    } else {
      break;
    }
  }
  return parts.join(" || ");
}

function loginErrorParamFromMessageBlob(msg: string): string {
  if (!msg.trim()) return "auth_backend";
  if (/DATABASE_URL|DIRECT_URL|Environment variable not found|P1013|invalid.*database string/i.test(msg)) {
    return "db_env";
  }
  if (/P2024|P2037|P1008|too many connections|connection pool|pool timeout|prepared statement/i.test(msg)) {
    return "db_pool";
  }
  if (
    /P1001|P1003|P1017|Can't reach database|connection.*refused|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|getaddrinfo|timed out/i.test(
      msg,
    )
  ) {
    return "db_connect";
  }
  if (/P2021|P2022|P2010|relation .+ does not exist|table .+ does not exist|column .+ does not exist/i.test(msg)) {
    return "db_schema";
  }
  return "auth_backend";
}

/**
 * Maps Prisma (or related) failures from `getAppAuth()` to `?error=` keys on `/login`.
 */
export function loginErrorParamFromGetAppAuthFailure(err: unknown): string {
  if (err instanceof PrismaClientInitializationError) {
    if (/DATABASE_URL|DIRECT_URL|Environment variable not found/i.test(err.message)) {
      return "db_env";
    }
    return "db_connect";
  }
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P1001":
      case "P1003":
      case "P1017":
      case "P1008":
        return "db_connect";
      case "P2024":
      case "P2037":
        return "db_pool";
      case "P2021":
      case "P2022":
      case "P2010":
        return "db_schema";
      default:
        return "auth_backend";
    }
  }
  return loginErrorParamFromMessageBlob(messageFromUnknownError(err));
}
