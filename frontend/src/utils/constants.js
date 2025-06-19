// API endpoints
export const API_ENDPOINTS = {
    STUDENTS: '/students',
    SYNC: '/sync',
    CRON: '/cron',
    HEALTH: '/health',
};

// Chart colors
export const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#14b8a6',
    accent: '#f97316',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    gray: '#6b7280',
};

// Rating color mapping
export const RATING_COLORS = {
    0: '#9ca3af',      // Gray - Unrated
    800: '#94a3b8',    // Gray - Newbie
    1200: '#22c55e',   // Green - Pupil
    1400: '#06b6d4',   // Cyan - Specialist  
    1600: '#3b82f6',   // Blue - Expert
    1900: '#8b5cf6',   // Purple - Candidate Master
    2100: '#f59e0b',   // Orange - Master
    2300: '#f97316',   // Red - International Master
    2400: '#ef4444',   // Red - Grandmaster
    2600: '#dc2626',   // Dark Red - International Grandmaster
    3000: '#7f1d1d',   // Very Dark Red - Legendary Grandmaster
};

// Rating titles
export const RATING_TITLES = {
    0: 'Unrated',
    800: 'Newbie',
    1200: 'Pupil',
    1400: 'Specialist',
    1600: 'Expert',
    1900: 'Candidate Master',
    2100: 'Master',
    2300: 'International Master',
    2400: 'Grandmaster',
    2600: 'International Grandmaster',
    3000: 'Legendary Grandmaster',
};

// Time filters for analytics
export const TIME_FILTERS = {
    CONTEST: [
        { value: 30, label: 'Last 30 days' },
        { value: 90, label: 'Last 90 days' },
        { value: 365, label: 'Last year' },
    ],
    PROBLEM: [
        { value: 7, label: 'Last 7 days' },
        { value: 30, label: 'Last 30 days' },
        { value: 90, label: 'Last 90 days' },
    ],
};

// Problem rating buckets
export const RATING_BUCKETS = [
    { min: 800, max: 1000, label: '800-1000' },
    { min: 1001, max: 1200, label: '1001-1200' },
    { min: 1201, max: 1400, label: '1201-1400' },
    { min: 1401, max: 1600, label: '1401-1600' },
    { min: 1601, max: 1800, label: '1601-1800' },
    { min: 1801, max: 2000, label: '1801-2000' },
    { min: 2001, max: 3500, label: '2000+' },
];

// Status messages
export const STATUS_MESSAGES = {
    LOADING: 'Loading...',
    ERROR: 'Something went wrong',
    NO_DATA: 'No data available',
    SUCCESS: 'Operation completed successfully',
    SYNC_STARTED: 'Sync started...',
    SYNC_COMPLETED: 'Data synchronized successfully',
    SYNC_FAILED: 'Sync failed',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date formats
export const DATE_FORMATS = {
    SHORT: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    TIME: 'HH:mm',
    DATETIME: 'MMM dd, yyyy HH:mm',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// Breakpoints (Tailwind CSS)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
};

// Animation durations (in ms)
export const ANIMATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
};

// Local storage keys
export const STORAGE_KEYS = {
    THEME: 'theme',
    USER_PREFERENCES: 'user_preferences',
    LAST_SYNC: 'last_sync',
};

// Form validation patterns
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    CODEFORCES_HANDLE: /^[a-zA-Z0-9_]{3,24}$/,
};

// Error messages
export const ERROR_MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_HANDLE: 'Handle must be 3-24 characters (letters, numbers, underscore only)',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
};

// Success messages
export const SUCCESS_MESSAGES = {
    STUDENT_CREATED: 'Student created successfully',
    STUDENT_UPDATED: 'Student updated successfully',
    STUDENT_DELETED: 'Student deleted successfully',
    DATA_EXPORTED: 'Data exported successfully',
    SYNC_COMPLETED: 'Data synchronized successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
};

// Chart configuration defaults
export const CHART_DEFAULTS = {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 1)',
    borderWidth: 2,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 6,
};

// Heatmap intensity colors
export const HEATMAP_COLORS = {
    0: '#f3f4f6',      // Very light gray
    1: '#dcfce7',      // Light green
    2: '#bbf7d0',      // Medium light green
    3: '#86efac',      // Medium green
    4: '#4ade80',      // Strong green
    5: '#22c55e',      // Very strong green
};

// Contest types
export const CONTEST_TYPES = {
    CF: 'Codeforces',
    IOI: 'IOI',
    ICPC: 'ICPC',
};

// Cron schedule presets
export const CRON_PRESETS = [
    { value: '0 2 * * *', label: 'Daily at 2:00 AM' },
    { value: '0 */6 * * *', label: 'Every 6 hours' },
    { value: '0 0 */2 * *', label: 'Every 2 days' },
    { value: '0 1 * * 0', label: 'Weekly (Sunday 1:00 AM)' },
    { value: '*/30 * * * *', label: 'Every 30 minutes' },
];

export default {
    API_ENDPOINTS,
    CHART_COLORS,
    RATING_COLORS,
    RATING_TITLES,
    TIME_FILTERS,
    RATING_BUCKETS,
    STATUS_MESSAGES,
    PAGINATION,
    DATE_FORMATS,
    BREAKPOINTS,
    ANIMATIONS,
    STORAGE_KEYS,
    VALIDATION_PATTERNS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CHART_DEFAULTS,
    HEATMAP_COLORS,
    CONTEST_TYPES,
    CRON_PRESETS,
};