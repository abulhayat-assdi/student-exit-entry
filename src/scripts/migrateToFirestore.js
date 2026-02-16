// Migration Script: localStorage to Firestore
// This script helps migrate existing student logs from localStorage to Firestore

import { addLog } from '../services/firestoreService.js';
import { initializeStudentsDatabase } from '../services/studentService.js';
import { studentsDatabase } from '../data/students.js';

/**
 * Migrate logs from localStorage to Firestore
 * Run this function once in the browser console to migrate existing data
 */
export const migrateLocalStorageToFirestore = async () => {
    console.log('🚀 Starting migration from localStorage to Firestore...');

    try {
        // Step 1: Initialize students database
        console.log('📚 Step 1: Initializing students database...');
        await initializeStudentsDatabase(studentsDatabase);
        console.log('✅ Students database initialized');

        // Step 2: Get logs from localStorage
        console.log('📦 Step 2: Reading logs from localStorage...');
        const savedLogs = localStorage.getItem('studentLogs');

        if (!savedLogs) {
            console.log('⚠️ No logs found in localStorage');
            return { success: true, message: 'No logs to migrate', count: 0 };
        }

        const logs = JSON.parse(savedLogs);
        console.log(`📊 Found ${logs.length} logs in localStorage`);

        // Step 3: Upload logs to Firestore
        console.log('☁️ Step 3: Uploading logs to Firestore...');
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < logs.length; i++) {
            try {
                const log = logs[i];
                await addLog(log);
                successCount++;
                console.log(`✓ Migrated log ${i + 1}/${logs.length}: ${log.name} - ${log.status}`);
            } catch (error) {
                errorCount++;
                console.error(`✗ Failed to migrate log ${i + 1}:`, error);
            }
        }

        console.log('\n🎉 Migration completed!');
        console.log(`✅ Successfully migrated: ${successCount} logs`);
        if (errorCount > 0) {
            console.log(`❌ Failed to migrate: ${errorCount} logs`);
        }

        // Step 4: Backup localStorage (optional)
        console.log('\n💾 Backing up localStorage data...');
        localStorage.setItem('studentLogs_backup', savedLogs);
        console.log('✅ Backup created as "studentLogs_backup"');

        return {
            success: true,
            message: 'Migration completed successfully',
            totalLogs: logs.length,
            successCount,
            errorCount
        };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return {
            success: false,
            message: error.message,
            error
        };
    }
};

/**
 * Clear localStorage after successful migration
 * WARNING: Only run this after verifying data in Firestore
 */
export const clearLocalStorageAfterMigration = () => {
    const confirmation = confirm(
        'Are you sure you want to clear localStorage?\n\n' +
        'Make sure you have verified that all data is in Firestore before proceeding.\n\n' +
        'A backup will be kept as "studentLogs_backup".'
    );

    if (confirmation) {
        localStorage.removeItem('studentLogs');
        console.log('✅ localStorage cleared. Backup still available as "studentLogs_backup"');
        return true;
    } else {
        console.log('❌ Operation cancelled');
        return false;
    }
};

// Instructions for running migration:
console.log(`
🔧 Migration Instructions:
==========================

1. Open your browser console (F12)

2. Import and run the migration:
   import { migrateLocalStorageToFirestore } from './scripts/migrateToFirestore.js';
   await migrateLocalStorageToFirestore();

3. Verify data in Firestore Console

4. (Optional) Clear localStorage:
   import { clearLocalStorageAfterMigration } from './scripts/migrateToFirestore.js';
   clearLocalStorageAfterMigration();
`);
