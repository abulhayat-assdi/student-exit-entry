// Student Service for Firestore
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const STUDENTS_COLLECTION = 'students';

/**
 * Fetch all students from Firestore
 * @returns {Promise<Array>} - Array of student objects
 */
export const fetchStudents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
        const students = [];
        querySnapshot.forEach((doc) => {
            students.push({
                id: doc.id,
                ...doc.data()
            });
        });
        console.log('Fetched', students.length, 'students from Firestore');
        return students;
    } catch (error) {
        console.error('Error fetching students from Firestore:', error);
        throw error;
    }
};

/**
 * Find a student by roll number
 * @param {string} rollNo - Student roll number
 * @returns {Promise<Object|null>} - Student object or null if not found
 */
export const findStudentByRoll = async (rollNo) => {
    try {
        const studentsQuery = query(
            collection(db, STUDENTS_COLLECTION),
            where('rollNo', '==', rollNo.trim())
        );
        const querySnapshot = await getDocs(studentsQuery);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error finding student by roll:', error);
        throw error;
    }
};

/**
 * Add a new student to Firestore
 * @param {Object} studentData - Student data {rollNo, name}
 * @returns {Promise<string>} - Document ID of the created student
 */
export const addStudent = async (studentData) => {
    try {
        // Use rollNo as document ID for easier lookups
        const studentRef = doc(db, STUDENTS_COLLECTION, studentData.rollNo);
        await setDoc(studentRef, {
            ...studentData,
            createdAt: serverTimestamp()
        });
        console.log('Student added to Firestore:', studentData.rollNo);
        return studentData.rollNo;
    } catch (error) {
        console.error('Error adding student to Firestore:', error);
        throw error;
    }
};

/**
 * Update a student's information
 * @param {string} rollNo - Student roll number (document ID)
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateStudent = async (rollNo, updates) => {
    try {
        const studentRef = doc(db, STUDENTS_COLLECTION, rollNo);
        await updateDoc(studentRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('Student updated successfully:', rollNo);
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
};

/**
 * Bulk upload students to Firestore
 * @param {Array} students - Array of student objects {rollNo, name}
 * @returns {Promise<number>} - Number of students uploaded
 */
export const bulkUploadStudents = async (students) => {
    try {
        let count = 0;
        for (const student of students) {
            await addStudent(student);
            count++;
        }
        console.log('Bulk uploaded', count, 'students to Firestore');
        return count;
    } catch (error) {
        console.error('Error bulk uploading students:', error);
        throw error;
    }
};

/**
 * Initialize students database from local data
 * @param {Array} studentsData - Array of student objects from local database
 * @returns {Promise<void>}
 */
export const initializeStudentsDatabase = async (studentsData) => {
    try {
        // Check if students already exist
        const existingStudents = await fetchStudents();

        if (existingStudents.length > 0) {
            console.log('Students database already initialized');
            return;
        }

        // Upload all students
        console.log('Initializing students database...');
        await bulkUploadStudents(studentsData);
        console.log('Students database initialized successfully');
    } catch (error) {
        console.error('Error initializing students database:', error);
        throw error;
    }
};
