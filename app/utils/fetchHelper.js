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

  // let data;
  // try {
  //   data = await res.json();
  // } catch {
  //   data = null;
  // }

  // if (!res.ok) {
  //   throw new Error(data?.message || `HTTP ${res.status}: ${res.statusText}`);
  // }

  if (!res.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await res.json();
      errorMessage = errorData?.message || errorMessage;
    } catch {}
    alert(errorMessage);
  }

  return res;
};
