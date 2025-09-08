let STUDIO_ID = localStorage.getItem('activeStudioId') || null;

const setStudioId = (studioId) => {
    STUDIO_ID = studioId;
    if (studioId) {
        localStorage.setItem('activeStudioId', studioId);
    } else {
        localStorage.removeItem('activeStudioId');
    }
};

const customFetch = async (url, options = {}) => {
    const headers = options.headers || new Headers();
    if (STUDIO_ID) {
        headers.set('x-studio-id', STUDIO_ID);
    }
    // Only set Content-Type for methods that typically have a body
    if (options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const updatedOptions = { ...options, headers, credentials: 'include' };

    const response = await fetch(url, updatedOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Server error: ${response.statusText}` }));
        throw new Error(errorData.message || 'An API error occurred');
    }
    
    if (response.status === 204) return null; // No Content
    return response.json();
};

export default {
    setStudioId,
    get: (url, options) => customFetch(url, { ...options, method: 'GET' }),
    post: (url, body, options) => customFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (url, body, options) => customFetch(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),       // <-- Added
    patch: (url, body, options) => customFetch(url, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url, options) => customFetch(url, { ...options, method: 'DELETE' }),                                    // <-- Added
};