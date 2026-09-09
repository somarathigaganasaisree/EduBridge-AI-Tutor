const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const RAG_BASE_URL =
  import.meta.env.VITE_RAG_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "edubridge_token";


function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}


async function parseResponseBody(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text || null;
}


export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}


export async function apiRequest(path, options = {}) {
  const {
    headers = {},
    body,
    ...restOptions
  } = options;

  const requestHeaders = {
    ...getAuthHeaders(),
    ...headers,
  };

  const hasBody =
    body !== undefined &&
    body !== null;

  const isFormData =
    typeof FormData !== "undefined" &&
    body instanceof FormData;

  if (
    hasBody &&
    !isFormData &&
    !requestHeaders["Content-Type"]
  ) {
    requestHeaders["Content-Type"] =
      "application/json";
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...restOptions,
        headers: requestHeaders,
        body:
          hasBody &&
          !isFormData &&
          typeof body !== "string"
            ? JSON.stringify(body)
            : body,
      }
    );
  } catch (error) {
    throw new ApiError(
      "Unable to reach the server. Check that the backend is running.",
      {
        status: 0,
        data: {
          cause: error?.message,
        },
      }
    );
  }

  let data;

  try {
    data = await parseResponseBody(response);
  } catch (error) {
    throw new ApiError(
      "The server returned an unreadable response.",
      {
        status: response.status,
        data: {
          cause: error?.message,
        },
      }
    );
  }

  if (!response.ok) {
    const message =
      (
        data &&
        typeof data === "object" &&
        (data.detail || data.message)
      ) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(
      message,
      {
        status: response.status,
        data,
      }
    );
  }

  return data;
}


export const api = {

  get: (path, options) =>
    apiRequest(path, {
      ...options,
      method: "GET",
    }),

  post: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "POST",
      body,
    }),

  put: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PUT",
      body,
    }),

  patch: (path, body, options) =>
    apiRequest(path, {
      ...options,
      method: "PATCH",
      body,
    }),

  delete: (path, options) =>
    apiRequest(path, {
      ...options,
      method: "DELETE",
      body: options?.body,
    }),


  // AI Tutor / RAG
  ask: async (question, context = {}) => {
    try {
      const response = await fetch(
        `${RAG_BASE_URL}/ask`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question,

            class_name:
              context.className || "",

            subject:
              context.subject || "",
          }),
        }
      );

      const data =
        await parseResponseBody(response);

      if (!response.ok) {
        throw new ApiError(
          data?.detail ||
            "Unable to get an AI response.",
          {
            status: response.status,
            data,
          }
        );
      }

      return data;

    } catch (error) {

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        "Unable to reach the AI Tutor service.",
        {
          status: 0,
          data: {
            cause: error?.message,
          },
        }
      );
    }
  },
};


export {
  API_BASE_URL,
  TOKEN_KEY,
  RAG_BASE_URL,
};