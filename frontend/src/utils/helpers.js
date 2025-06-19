import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { RATING_COLORS, RATING_TITLES, DATE_FORMATS } from './constants';

// Date formatting utilities
export const formatDate = (date, formatStr = DATE_FORMATS.SHORT) => {
  if (!date) return 'Never';

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, formatStr) : 'Invalid date';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Get relative time string
export const getRelativeTime = (date) => {
  if (!date) return 'Never';

  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Invalid date';

    const days = differenceInDays(new Date(), parsedDate);

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;

    return `${Math.floor(days / 365)} years ago`;
  } catch (error) {
    console.error('Relative time error:', error);
    return 'Invalid date';
  }
};

// Rating utilities
export const getRatingColor = (rating) => {
  if (!rating || rating < 800) return RATING_COLORS[0];

  const thresholds = Object.keys(RATING_COLORS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (rating >= threshold) {
      return RATING_COLORS[threshold];
    }
  }

  return RATING_COLORS[0];
};

export const getRatingTitle = (rating) => {
  if (!rating || rating < 800) return RATING_TITLES[0];

  const thresholds = Object.keys(RATING_TITLES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (rating >= threshold) {
      return RATING_TITLES[threshold];
    }
  }

  return RATING_TITLES[0];
};

// Number formatting utilities
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
};

export const formatRating = (rating) => {
  if (!rating || rating === 0) return 'Unrated';
  return formatNumber(rating);
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

// String utilities
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const kebabCase = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

// Validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[+]?[\d]{1,16}$/;
  return regex.test(phone.replace(/[\s\-()]/g, ''));

};

export const validateCodeforcesHandle = (handle) => {
  const regex = /^[a-zA-Z0-9_]{3,24}$/;
  return regex.test(handle);
};

// Array utilities
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];

    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const unique = (array, key) => {
  if (!key) return [...new Set(array)];

  const seen = new Set();
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// Object utilities
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (key in obj) result[key] = obj[key];
    return result;
  }, {});
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// URL utilities
export const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return filteredParams ? `?${filteredParams}` : '';
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage:`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage:`, error);
    return false;
  }
};

// Analytics utilities
export const calculateStats = (data) => {
  if (!data || data.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
      median: 0,
    };
  }

  const values = data.map(item => typeof item === 'number' ? item : parseFloat(item)).filter(v => !isNaN(v));
  const sorted = [...values].sort((a, b) => a - b);

  return {
    count: values.length,
    sum: values.reduce((sum, val) => sum + val, 0),
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    median: sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)],
  };
};

// Chart data processing
export const processChartData = (data, xKey, yKey, options = {}) => {
  const {
    sortBy: sortKey = xKey,
    sortDirection = 'asc',
    limit = null,
    // fillGaps = false
  } = options;

  let processedData = [...data];

  // Sort data
  if (sortKey) {
    processedData = sortBy(processedData, sortKey, sortDirection);
  }

  // Limit data points
  if (limit && limit > 0) {
    processedData = processedData.slice(0, limit);
  }

  // Extract chart data
  const labels = processedData.map(item => item[xKey]);
  const values = processedData.map(item => item[yKey]);

  return {
    labels,
    datasets: [{
      data: values,
      ...options.datasetOptions
    }]
  };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

// Download file from blob
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Generate random ID
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const utils = {
  formatDate,
  getRelativeTime,
  getRatingColor,
  getRatingTitle,
  formatNumber,
  formatRating,
  formatPercentage,
  truncateText,
  capitalizeFirst,
  kebabCase,
  validateEmail,
  validatePhone,
  validateCodeforcesHandle,
  sortBy,
  groupBy,
  unique,
  isEmpty,
  pick,
  omit,
  buildQueryString,
  parseQueryString,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  calculateStats,
  processChartData,
  debounce,
  throttle,
  copyToClipboard,
  downloadBlob,
  generateId,
  formatFileSize,
};

export default utils;