type QueryValue = string | number | boolean | null | undefined;

export const API_BASE_URL = "";

export class ApiUnavailableError extends Error {
  constructor() {
    super("API base URL is not configured.");
  }
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function isApiConfigured() {
  return API_BASE_URL.trim().length > 0;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Record<string, QueryValue> } = {},
) {
  if (!isApiConfigured()) {
    throw new ApiUnavailableError();
  }

  const { query, headers, ...requestOptions } = options;
  const url = `${API_BASE_URL}${path}${toQueryString(query)}`;
  const isMultipart = requestOptions.body instanceof FormData;
  const response = await fetch(url, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

function toQueryString(query?: Record<string, QueryValue>) {
  if (!query) return "";

  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );

  return params.length > 0 ? `?${params.join("&")}` : "";
}

async function getErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}
