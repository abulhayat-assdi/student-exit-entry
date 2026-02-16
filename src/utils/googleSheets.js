// Placeholder URL for Google Sheets integration
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxI-Y61xQ4Aedtaaci3vXUylSSToLtbLU3MSJcOncZ3oKzvuicQH8ptyHS23YvJLmtg/exec';

export const submitToGoogleSheet = async (logData) => {
    try {
        // Google Apps Script requires a specific format to avoid CORS issues
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            body: JSON.stringify(logData),
        });

        // Note: With 'no-cors' mode, we can't read the response
        // But the data will still be sent to Google Sheets
        console.log('✅ ডাটা Google Sheets এ পাঠানো হয়েছে:', logData);
        return { success: true, message: 'Data sent to Google Sheets' };

    } catch (error) {
        console.error('❌ Google Sheets এ পাঠাতে সমস্যা হয়েছে:', error);
        console.log('📝 লগ ডাটা:', logData);
        return { success: false, message: 'Failed to send to Google Sheets' };
    }
};
