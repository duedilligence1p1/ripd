import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (email: string, password: string, name: string) =>
        api.post('/auth/register', { email, password, name }),
    getMe: () => api.get('/auth/me'),
};

// Projects API
export const projectsApi = {
    list: () => api.get('/projects'),
    get: (id: string) => api.get(`/projects/${id}`),
    create: (data: any) => api.post('/projects', data),
    update: (id: string, data: any) => api.put(`/projects/${id}`, data),
    delete: (id: string) => api.delete(`/projects/${id}`),
    updateStatus: (id: string, status: string) =>
        api.put(`/projects/${id}/status`, { status }),
};

// Risks API
export const risksApi = {
    listByProject: (projectId: string) => api.get(`/risks/project/${projectId}`),
    create: (data: any) => api.post('/risks', data),
    generate: (projectId: string) => api.post('/risks/generate', { projectId }),
    update: (id: string, data: any) => api.put(`/risks/${id}`, data),
    delete: (id: string) => api.delete(`/risks/${id}`),
};

// Actions API
export const actionsApi = {
    listByProject: (projectId: string) => api.get(`/actions/project/${projectId}`),
    create: (data: any) => api.post('/actions', data),
    generate: (projectId: string) => api.post('/actions/generate', { projectId }),
    update: (id: string, data: any) => api.put(`/actions/${id}`, data),
    updateStatus: (id: string, status: string) =>
        api.put(`/actions/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/actions/${id}`),
};

// PDF API
export const pdfApi = {
    download: async (projectId: string) => {
        const response = await api.get(`/pdf/project/${projectId}`, {
            responseType: 'blob',
        });
        return response;
    },
    preview: (projectId: string) =>
        `${API_URL}/pdf/project/${projectId}/preview`,
};

export default api;
