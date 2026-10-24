/** Точка входа в API: import { login, ErrorCode, ... } from "../shared/api" (путь относительно файла). */
export { API_BASE, ApiError, api, getHealth, http } from "./client";
export type { HealthResponse } from "./client";
export * from "./types";
export * from "./session";
export * from "./guest";
export * from "./players";
