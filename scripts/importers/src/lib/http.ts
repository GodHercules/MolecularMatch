import axios from "axios";
import { wait } from "./logger";

export async function fetchWithRetry<T>(
  request: () => Promise<T>,
  retries = 5,
  baseDelayMs = 500
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      const delay = baseDelayMs * 2 ** attempt;
      await wait(delay);
      attempt += 1;
    }
  }

  throw lastError;
}

export async function httpGetJson<T>(url: string, timeoutMs = 45000): Promise<T> {
  const response = await axios.get<T>(url, { timeout: timeoutMs });
  return response.data;
}

export async function httpGetText(url: string, timeoutMs = 45000): Promise<string> {
  const response = await axios.get<string>(url, { timeout: timeoutMs, responseType: "text" });
  return response.data;
}

