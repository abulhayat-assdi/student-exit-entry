// Firestore Service for Student Exit/Entry Logs
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const LOGS_COLLECTION = 'logs';

/**
 * Add a new log entry to Firestore
 * @param {Object} logData - Log data {date, rollNo, name, time, status}
 * @returns {Promise<string>} - Document ID of the created log
 */
export const addLog = async (logData) => {
    try {
        const docRef = await addDoc(collection(db, LOGS_COLLECTION), {
            ...logData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('Log added to Firestore with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding log to Firestore:', error);
        throw error;
    }
};

/**
 * Fetch all logs from Firestore
 * @returns {Promise<Array>} - Array of log objects with IDs
 */
export const fetchLogs = async () => {
    try {
        const logsQuery = query(
            collection(db, LOGS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(logsQuery);
        const logs = [];
        querySnapshot.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log('Fetched', logs.length, 'logs from Firestore');
        return logs;
    } catch (error) {
        console.error('Error fetching logs from Firestore:', error);
        throw error;
    }
};

/**
 * Subscribe to real-time log updates
 * @param {Function} callback - Callback function to receive updated logs
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToLogs = (callback) => {
    try {
        const logsQuery = query(
            collection(db, LOGS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(logsQuery, (querySnapshot) => {
            const logs = [];
            querySnapshot.forEach((doc) => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log('Real-time update: received', logs.length, 'logs');
            callback(logs);
        }, (error) => {
            console.error('Error in real-time listener:', error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up real-time listener:', error);
        throw error;
    }
};

/**
 * Fetch logs for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of log objects
 */
export const fetchLogsByDate = async (date) => {
    try {
        const logsQuery = query(
            collection(db, LOGS_COLLECTION),
            where('date', '==', date),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(logsQuery);
        const logs = [];
        querySnapshot.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return logs;
    } catch (error) {
        console.error('Error fetching logs by date:', error);
        throw error;
    }
};

/**
 * Fetch logs for a specific student
 * @param {string} rollNo - Student roll number
 * @returns {Promise<Array>} - Array of log objects
 */
export const fetchLogsByStudent = async (rollNo) => {
    try {
        const logsQuery = query(
            collection(db, LOGS_COLLECTION),
            where('rollNo', '==', rollNo),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(logsQuery);
        const logs = [];
        querySnapshot.forEach((doc) => {
            logs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return logs;
    } catch (error) {
        console.error('Error fetching logs by student:', error);
        throw error;
    }
};

/**
 * Search logs by name or roll number
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} - Array of matching log objects
 */
export const searchLogs = async (searchQuery) => {
    try {
        // Fetch all logs and filter client-side
        // Firestore doesn't support case-insensitive or partial string matching natively
        const allLogs = await fetchLogs();
        const query = searchQuery.toLowerCase().trim();

        const filteredLogs = allLogs.filter(log =>
            log.name.toLowerCase().includes(query) ||
            log.rollNo.toLowerCase().includes(query)
        );

        return filteredLogs;
    } catch (error) {
        console.error('Error searching logs:', error);
        throw error;
    }
};

/**
 * Update a log entry
 * @param {string} logId - Document ID of the log
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateLog = async (logId, updates) => {
    try {
        const logRef = doc(db, LOGS_COLLECTION, logId);
        await updateDoc(logRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('Log updated successfully:', logId);
    } catch (error) {
        console.error('Error updating log:', error);
        throw error;
    }
};

/**
 * Delete a log entry
 * @param {string} logId - Document ID of the log
 * @returns {Promise<void>}
 */
export const deleteLog = async (logId) => {
    try {
        const logRef = doc(db, LOGS_COLLECTION, logId);
        await deleteDoc(logRef);
        console.log('Log deleted successfully:', logId);
    } catch (error) {
        console.error('Error deleting log:', error);
        throw error;
    }
};

/**
 * Get a single log by ID
 * @param {string} logId - Document ID of the log
 * @returns {Promise<Object>} - Log object
 */
export const getLogById = async (logId) => {
    try {
        const logRef = doc(db, LOGS_COLLECTION, logId);
        const logSnap = await getDoc(logRef);

        if (logSnap.exists()) {
            return {
                id: logSnap.id,
                ...logSnap.data()
            };
        } else {
            throw new Error('Log not found');
        }
    } catch (error) {
        console.error('Error getting log by ID:', error);
        throw error;
    }
};
