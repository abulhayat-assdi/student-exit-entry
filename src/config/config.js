// Google Sheets API Configuration
// After deploying Google Apps Script, update the URL below

export const config = {
    // TODO: Replace this with your deployed Google Apps Script web app URL
    GOOGLE_SHEETS_API_URL: 'YOUR_DEPLOYED_WEB_APP_URL_HERE',

    // API settings
    API_TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second

    // Feature flags
    USE_GOOGLE_SHEETS: true, // Set to false to use localStorage only
    FALLBACK_TO_LOCALSTORAGE: true, // Fallback to localStorage if API fails
};

// Validation
export const isConfigured = () => {
    return config.GOOGLE_SHEETS_API_URL &&
        config.GOOGLE_SHEETS_API_URL !== 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
};
