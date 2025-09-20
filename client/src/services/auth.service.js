import api from './api';

export const login = (userName, pass) => {
    return api.post('/api/auth/login', { userName, pass });
};

export const register = (userData) => {
    return api.post('/api/auth/register', userData);
};

export const verify = () => {
    return api.get('/api/auth/verify');
};

export const logout = () => {
    return api.get('/api/auth/logout');
};