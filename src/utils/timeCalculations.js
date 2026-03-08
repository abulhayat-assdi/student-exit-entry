/**
 * Calculate duration between exit and entry times
 * @param {string} exitDate - Exit date in format "YYYY-MM-DD"
 * @param {string} exitTime - Exit time in format "HH:MM:SS AM/PM"
 * @param {string} entryDate - Entry date in format "YYYY-MM-DD"
 * @param {string} entryTime - Entry time in format "HH:MM:SS AM/PM"
 * @returns {string} Duration in format "Xd Yh Zm" or "Yh Zm" or "Zm" or "N/A"
 */
export function calculateDuration(exitDate, exitTime, entryDate, entryTime) {
    if (!exitDate || !exitTime || !entryDate || !entryTime) {
        return 'N/A';
    }

    try {
        // Parse time strings to Date objects
        const parseDateTime = (dateStr, timeStr) => {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes, seconds] = time.split(':').map(Number);

            let hour24 = hours;
            if (period === 'PM' && hours !== 12) {
                hour24 = hours + 12;
            } else if (period === 'AM' && hours === 12) {
                hour24 = 0;
            }

            const date = new Date(dateStr);
            date.setHours(hour24, minutes, seconds || 0, 0);
            return date;
        };

        const exitObj = parseDateTime(exitDate, exitTime);
        const entryObj = parseDateTime(entryDate, entryTime);

        // Calculate difference in milliseconds
        let diffMs = entryObj - exitObj;

        // If for some reason entry is strictly before exit, handle it edge case
        if (diffMs < 0) {
            return 'Invalid Time';
        }

        // Convert to days, hours, and minutes
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const remainingMinutes = totalMinutes % (60 * 24);
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;

        // Format output
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);

        if (parts.length > 0) {
            return parts.join(' ');
        } else {
            return '< 1m';
        }
    } catch (error) {
        console.error('Error calculating duration:', error);
        return 'N/A';
    }
}

/**
 * Helper function to parse Date and Time string into comparable timestamp
 */
function getTimestamp(dateStr, timeStr) {
    try {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes, seconds] = time.split(':').map(Number);

        let hour24 = hours;
        if (period === 'PM' && hours !== 12) {
            hour24 = hours + 12;
        } else if (period === 'AM' && hours === 12) {
            hour24 = 0;
        }

        const date = new Date(dateStr);
        date.setHours(hour24, minutes, seconds || 0, 0);
        return date.getTime();
    } catch (e) {
        return new Date(dateStr).getTime();
    }
}

/**
 * Group exit and entry logs by roll number across multiple days
 * @param {Array} logs - Array of log entries
 * @returns {Array} Array of paired exit/entry records with duration
 */
export function groupExitEntryPairs(logs) {
    const pairs = [];

    // Group logs by student (rollNo)
    const studentLogsMap = new Map();
    logs.forEach(log => {
        if (!studentLogsMap.has(log.rollNo)) {
            studentLogsMap.set(log.rollNo, []);
        }
        studentLogsMap.get(log.rollNo).push(log);
    });

    studentLogsMap.forEach((studentLogs, rollNo) => {
        // Sort logs for this student chronologically
        studentLogs.sort((a, b) => getTimestamp(a.date, a.time) - getTimestamp(b.date, b.time));

        let currentExit = null;

        studentLogs.forEach(log => {
            if (log.status === 'OUT') {
                // If there's an existing exit that hasn't been paired, push it as "Still Out"
                if (currentExit) {
                    pairs.push({
                        date: currentExit.date, // Exit date
                        rollNo: currentExit.rollNo,
                        name: currentExit.name,
                        exitTime: currentExit.time,
                        entryTime: '-',
                        entryDate: '-',
                        duration: 'Still Out',
                        exitId: currentExit.id,
                        entryId: null,
                        exitReason: currentExit.reason || '',
                        entryReason: '-'
                    });
                }
                currentExit = log;
            } else if (log.status === 'IN') {
                if (currentExit) {
                    // Pair this entry with the preceding exit
                    pairs.push({
                        date: currentExit.date, // Exit date acts as primary date
                        rollNo: currentExit.rollNo,
                        name: currentExit.name,
                        exitTime: currentExit.time,
                        entryTime: log.time,
                        entryDate: log.date, // Store entry date to show multi-day difference
                        duration: calculateDuration(currentExit.date, currentExit.time, log.date, log.time),
                        exitId: currentExit.id,
                        entryId: log.id,
                        exitReason: currentExit.reason || '',
                        entryReason: log.reason || ''
                    });
                    currentExit = null; // Reset
                } else {
                    // An IN log without a preceding OUT log (an anomaly or missing data)
                    // We might choose to skip it or log it as an error entry. Let's just create a pair with missing exit info.
                    pairs.push({
                        date: log.date,
                        rollNo: log.rollNo,
                        name: log.name,
                        exitTime: '-',
                        entryDate: log.date,
                        entryTime: log.time,
                        duration: 'Missing Exit',
                        exitId: null,
                        entryId: log.id,
                        exitReason: '-',
                        entryReason: log.reason || ''
                    });
                }
            }
        });

        // If there's a trailing exit left over, it's still out
        if (currentExit) {
            pairs.push({
                date: currentExit.date,
                rollNo: currentExit.rollNo,
                name: currentExit.name,
                exitTime: currentExit.time,
                entryTime: '-',
                entryDate: '-',
                duration: 'Still Out',
                exitId: currentExit.id,
                entryId: null,
                exitReason: currentExit.reason || '',
                entryReason: '-'
            });
        }
    });

    return pairs;
}
