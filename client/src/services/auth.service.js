const API_URL = 'http://localhost:4060/api/auth'; // The base URL for your auth routes

// Helper function for fetch requests
async function fetchApi(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    // This is crucial for sending cookies
    credentials: 'include', 
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An error occurred');
  }
  
  // For requests that don't return a body (like logout)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  return response.json();
}

export const login = (userName, pass) => {
  return fetchApi('/login', {
    method: 'POST',
    body: JSON.stringify({ userName, pass }),
  });
};

export const register = (userData) => {
  return fetchApi('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const logout = () => {
  // GET request as defined in your backend router
  return fetchApi('/logout');
};

// A new function to verify the user's cookie on app load
export const verify = () => {
    // This assumes you will create a GET /verify route on your backend
    return fetchApi('/verify');
};
