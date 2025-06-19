import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add loading state or auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';

        // Don't show toast for certain errors that are handled by components
        if (!error.config?.skipErrorToast) {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

// Students API
export const studentsAPI = {
    // Get all students
    getAll: () => api.get('/students'),

    // Get student by ID
    getById: (id) => api.get(`/students/${id}`),

    // Create new student
    create: (studentData) => api.post('/students', studentData),

    // Update student
    update: (id, studentData) => api.put(`/students/${id}`, studentData),

    // Delete student
    delete: (id) => api.delete(`/students/${id}`),

    // Get student analytics data
    getData: (id, params = {}) => api.get(`/students/${id}/data`, { params }),

    // Export students to CSV
    exportCSV: () => api.get('/students/export/csv', {
        responseType: 'blob',
        headers: {
            'Accept': 'text/csv',
        },
    }),
};

// Sync API
export const syncAPI = {
    // Sync student by handle
    syncStudent: (handle) => api.post(`/sync/cf/${handle}`),

    // Sync all students
    syncAll: () => api.post('/sync/all'),

    // Get sync status
    getSyncStatus: (id) => api.get(`/sync/status/${id}`),
};

// Cron API
export const cronAPI = {
    // Get current schedule
    getSchedule: () => api.get('/cron/schedule'),

    // Update schedule
    updateSchedule: (schedule) => api.post('/cron/update', { schedule }),
};

// Health check
export const healthAPI = {
    check: () => api.get('/health'),
};

// Utility functions
export const handleAPIError = (error, customMessage = null) => {
    const message = customMessage ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred';

    console.error('API Error:', error);
    return message;
};

export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
};

export default api;