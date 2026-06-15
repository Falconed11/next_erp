/**
 * Centralized fetch helper for API requests
 * Automatically includes credentials and handles JSON responses/errors
 */
export const apiFetch = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json?.message || "An error occurred");
  }

  return res;
};
