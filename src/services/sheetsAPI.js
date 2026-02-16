import { config, isConfigured } from '../config/config.js';

/**
 * Google Sheets API Service
 * Handles all communication with Google Apps Script web app
 */

/**
 * Fetch all logs from Google Sheets
 * @returns {Promise<Array>} Array of log objects
 */
export const fetchLogs = async () => {
    // Check if API is configured
    if (!config.USE_GOOGLE_SHEETS || !isConfigured()) {
        console.warn('Google Sheets API not configured. Using localStorage.');
        return null;
    }

    try {
        const response = await fetchWithTimeout(
            config.GOOGLE_SHEETS_API_URL,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            config.API_TIMEOUT
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch logs');
        }

        return result.data || [];

    } catch (error) {
        console.error('Error fetching logs from Google Sheets:', error);

        if (config.FALLBACK_TO_LOCALSTORAGE) {
            console.warn('Falling back to localStorage');
            return null;
        }

        throw error;
    }
};

/**
 * Add a new log entry to Google Sheets
 * @param {Object} logEntry - Log entry object {date, rollNo, name, time, status}
 * @returns {Promise<Object>} Response from API
 */
export const addLog = async (logEntry) => {
    // Check if API is configured
    if (!config.USE_GOOGLE_SHEETS || !isConfigured()) {
        console.warn('Google Sheets API not configured. Using localStorage.');
        return null;
    }

    try {
        const response = await fetchWithTimeout(
            config.GOOGLE_SHEETS_API_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logEntry),
            },
            config.API_TIMEOUT
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to add log');
        }

        return result;

    } catch (error) {
        console.error('Error adding log to Google Sheets:', error);

        if (config.FALLBACK_TO_LOCALSTORAGE) {
            console.warn('Falling back to localStorage');
            return null;
        }

        throw error;
    }
};

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = (url, options, timeout) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
    ]);
};

/**
 * Test API connection
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
    if (!isConfigured()) {
        return false;
    }

    try {
        const logs = await fetchLogs();
        return logs !== null;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
};
