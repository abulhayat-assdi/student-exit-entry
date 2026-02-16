/**
 * Calculate duration between exit and entry times
 * @param {string} exitTime - Exit time in format "HH:MM:SS AM/PM"
 * @param {string} entryTime - Entry time in format "HH:MM:SS AM/PM"
 * @returns {string} Duration in format "Xh Ym" or "Ym" or "N/A"
 */
export function calculateDuration(exitTime, entryTime) {
    if (!exitTime || !entryTime) {
        return 'N/A';
    }

    try {
        // Parse time strings to Date objects
        const parseTime = (timeStr) => {
            const [time, period] = timeStr.split(' ');
            const [hours, minutes, seconds] = time.split(':').map(Number);

            let hour24 = hours;
            if (period === 'PM' && hours !== 12) {
                hour24 = hours + 12;
            } else if (period === 'AM' && hours === 12) {
                hour24 = 0;
            }

            const date = new Date();
            date.setHours(hour24, minutes, seconds || 0, 0);
            return date;
        };

        const exitDate = parseTime(exitTime);
        const entryDate = parseTime(entryTime);

        // Calculate difference in milliseconds
        let diffMs = entryDate - exitDate;

        // Handle case where entry is next day
        if (diffMs < 0) {
            diffMs += 24 * 60 * 60 * 1000; // Add 24 hours
        }

        // Convert to hours and minutes
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Format output
        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return '< 1m';
        }
    } catch (error) {
        console.error('Error calculating duration:', error);
        return 'N/A';
    }
}

/**
 * Group exit and entry logs by date and roll number
 * @param {Array} logs - Array of log entries
 * @returns {Array} Array of paired exit/entry records with duration
 */
export function groupExitEntryPairs(logs) {
    const pairs = [];
    const exitMap = new Map();

    // First pass: collect all exits
    logs.forEach(log => {
        if (log.status === 'OUT') {
            const key = `${log.date}_${log.rollNo}`;
            if (!exitMap.has(key)) {
                exitMap.set(key, []);
            }
            exitMap.get(key).push(log);
        }
    });

    // Second pass: match entries with exits
    logs.forEach(log => {
        if (log.status === 'IN') {
            const key = `${log.date}_${log.rollNo}`;
            const exits = exitMap.get(key);

            if (exits && exits.length > 0) {
                // Find the most recent exit before this entry
                const matchingExit = exits.find(exit => {
                    // Simple time comparison - in real app might need more sophisticated matching
                    return true; // For now, match first available exit
                });

                if (matchingExit) {
                    pairs.push({
                        date: log.date,
                        rollNo: log.rollNo,
                        name: log.name,
                        exitTime: matchingExit.time,
                        entryTime: log.time,
                        duration: calculateDuration(matchingExit.time, log.time),
                        exitId: matchingExit.id,  // Store exit log ID
                        entryId: log.id           // Store entry log ID
                    });

                    // Remove matched exit
                    const index = exits.indexOf(matchingExit);
                    exits.splice(index, 1);
                }
            }
        }
    });

    // Add unpaired exits (still outside)
    exitMap.forEach((exits, key) => {
        exits.forEach(exit => {
            pairs.push({
                date: exit.date,
                rollNo: exit.rollNo,
                name: exit.name,
                exitTime: exit.time,
                entryTime: '-',
                duration: 'Still Out',
                exitId: exit.id,    // Store exit log ID
                entryId: null       // No entry yet
            });
        });
    });

    return pairs;
}
