import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Calendar, Clock, User, LogOut, LogIn, Edit2, Trash2, X, Save, CheckCircle } from 'lucide-react';
import { groupExitEntryPairs } from '../utils/timeCalculations';
import { updateLog, deleteLog, fetchLogs } from '../services/firestoreService';

function SearchPage({ onBack }) {
    // Independent data fetching - no longer depends on logs prop
    const [allLogs, setAllLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [editingLog, setEditingLog] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [notification, setNotification] = useState(null);

    // Track current search to refresh after delete
    const [currentSearchType, setCurrentSearchType] = useState(null); // 'name' or 'date'
    const [currentSearchValue, setCurrentSearchValue] = useState('');

    // Fetch logs independently on component mount
    useEffect(() => {
        const loadLogs = async () => {
            try {
                const logs = await fetchLogs();
                setAllLogs(logs);
            } catch (error) {
                console.error('Error loading logs:', error);
            }
        };
        loadLogs();
    }, []);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setCurrentSearchType(null);
            setCurrentSearchValue('');
            return;
        }

        const query = searchQuery.toLowerCase().trim();

        // Filter logs by name or roll number
        const filteredLogs = allLogs.filter(log =>
            log.name.toLowerCase().includes(query) ||
            log.rollNo.toLowerCase().includes(query)
        );

        // Group into exit/entry pairs
        const pairedRecords = groupExitEntryPairs(filteredLogs);

        // Sort by date (newest first)
        pairedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        setSearchResults(pairedRecords);

        // Store search parameters for refresh after delete
        setCurrentSearchType('name');
        setCurrentSearchValue(query);
    };

    const handleDateSearch = () => {
        if (!searchDate) {
            setSearchResults([]);
            setCurrentSearchType(null);
            setCurrentSearchValue('');
            return;
        }

        // Filter logs by date
        const filteredLogs = allLogs.filter(log => log.date === searchDate);

        // Group into exit/entry pairs
        const pairedRecords = groupExitEntryPairs(filteredLogs);

        // Sort by time (can keep date sort for consistency)
        pairedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        setSearchResults(pairedRecords);

        // Store search parameters for refresh after delete
        setCurrentSearchType('date');
        setCurrentSearchValue(searchDate);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleDateKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleDateSearch();
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleEditClick = (log) => {
        setEditingLog(log);
        setEditFormData({
            time: log.time,
            status: log.status,
            date: log.date
        });
    };

    const handleEditSave = async () => {
        if (!editingLog || !editingLog.id) {
            showNotification('Cannot edit this log', 'error');
            return;
        }

        try {
            await updateLog(editingLog.id, editFormData);
            showNotification('Log updated successfully!', 'success');
            setEditingLog(null);
            setEditFormData({});
        } catch (error) {
            console.error('Error updating log:', error);
            showNotification('Failed to update log', 'error');
        }
    };

    const handleDeleteClick = (log) => {
        setDeleteConfirm(log);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) {
            showNotification('Cannot delete this log', 'error');
            return;
        }

        // Store the IDs before clearing deleteConfirm
        const exitIdToDelete = deleteConfirm.exitId;
        const entryIdToDelete = deleteConfirm.entryId;

        try {
            // Delete both exit and entry logs if they exist
            const deletePromises = [];

            if (exitIdToDelete) {
                deletePromises.push(deleteLog(exitIdToDelete));
            }

            if (entryIdToDelete) {
                deletePromises.push(deleteLog(entryIdToDelete));
            }

            if (deletePromises.length === 0) {
                showNotification('No logs to delete', 'error');
                return;
            }

            await Promise.all(deletePromises);

            // Close modal first
            setDeleteConfirm(null);

            // Show notification
            showNotification('Log(s) deleted successfully!', 'success');

            // Filter out deleted record from BOTH allLogs and searchResults
            // This prevents deleted records from reappearing when searching again
            setAllLogs(prevLogs =>
                prevLogs.filter(log => log.id !== exitIdToDelete && log.id !== entryIdToDelete)
            );

            setSearchResults(prevResults =>
                prevResults.filter(record => record.exitId !== exitIdToDelete)
            );


        } catch (error) {
            console.error('Error deleting log:', error);
            showNotification('Failed to delete log', 'error');
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="mb-8 animate-fadeIn text-center">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium mb-4 transition-all duration-200 hover:-translate-x-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                        Search History
                    </h1>
                    <p className="text-lg text-gray-600">
                        Search student exit/entry records by name, roll number, or date
                    </p>
                </div>

                {/* Search Bar */}
                <div className="professional-card p-8 mb-8 animate-fadeIn">
                    {/* Search by Name/Roll */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Search className="w-4 h-4 text-primary" />
                                Search by Name or Roll Number
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter student name or roll number..."
                                className="input-professional w-full px-4 py-3 rounded-lg"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleSearch}
                                className="btn-primary px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                            >
                                <Search className="w-5 h-5" />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                        </div>
                    </div>

                    {/* Search by Date */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Search by Date
                            </label>
                            <input
                                type="date"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                                onKeyPress={handleDateKeyPress}
                                className="input-professional w-full px-4 py-3 rounded-lg"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleDateSearch}
                                className="btn-primary px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-200"
                            >
                                <Calendar className="w-5 h-5" />
                                Search by Date
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                {
                    searchResults.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fadeIn">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock className="w-6 h-6 text-indigo-600" />
                                Search Results ({searchResults.length} records)
                            </h2>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Roll</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Out Time</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">In Time</th>
                                            <th className="text-left py-4 px-4 font-semibold text-gray-700">Duration</th>
                                            <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((record, index) => (
                                            <tr
                                                key={index}
                                                className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                    }`}
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-700 font-medium">{record.rollNo}</td>
                                                <td className="py-4 px-4 text-gray-900 font-semibold">{record.name}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2 text-red-600">
                                                        <LogOut className="w-4 h-4" />
                                                        <span className="font-medium">{record.exitTime}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2 text-indigo-600">
                                                        <LogIn className="w-4 h-4" />
                                                        <span className="font-medium">{record.entryTime}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${record.duration === 'Still Out'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {record.duration}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(record)}
                                                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(record)}
                                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {searchResults.map((record, index) => (
                                    <div
                                        key={index}
                                        className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{record.name}</p>
                                                <p className="text-sm text-gray-600">Roll: {record.rollNo}</p>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${record.duration === 'Still Out'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {record.duration}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(record.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-red-600">
                                                <LogOut className="w-4 h-4" />
                                                <span>Out: {record.exitTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-600">
                                                <LogIn className="w-4 h-4" />
                                                <span>In: {record.entryTime}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                                            <button
                                                onClick={() => handleEditClick(record)}
                                                className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(record)}
                                                className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* Empty State */}
                {
                    (searchQuery || searchDate) && searchResults.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center animate-fadeIn">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
                            <p className="text-gray-500">
                                {searchQuery
                                    ? `No records found for "${searchQuery}". Try searching with a different name or roll number.`
                                    : `No records found for ${new Date(searchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Try a different date.`
                                }
                            </p>
                        </div>
                    )
                }

                {/* Initial State */}
                {
                    !searchQuery && !searchDate && searchResults.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center animate-fadeIn">
                            <Search className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Start Searching</h3>
                            <p className="text-gray-500">
                                Enter a student name, roll number, or select a date to view exit/entry history.
                            </p>
                        </div>
                    )
                }

                {/* Notification */}
                {
                    notification && (
                        <div
                            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slideIn ${notification.type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                                }`}
                        >
                            {notification.type === 'success' ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <AlertCircle className="w-5 h-5" />
                            )}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    )
                }

                {/* Edit Modal */}
                {
                    editingLog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Edit Log</h3>
                                    <button
                                        onClick={() => setEditingLog(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Student Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editingLog.name}
                                            disabled
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Roll Number
                                        </label>
                                        <input
                                            type="text"
                                            value={editingLog.rollNo}
                                            disabled
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.date || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Time
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.time || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                                            placeholder="HH:MM:SS AM/PM"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={editFormData.status || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                        >
                                            <option value="OUT">Exit (OUT)</option>
                                            <option value="IN">Entry (IN)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleEditSave}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setEditingLog(null)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Delete Confirmation Modal */}
                {
                    deleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fadeIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Confirm Delete</h3>
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <p className="text-gray-700 mb-4">
                                        Are you sure you want to delete this log entry?
                                    </p>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                        <p className="font-semibold text-gray-900">{deleteConfirm.name}</p>
                                        <p className="text-sm text-gray-600">Roll: {deleteConfirm.rollNo}</p>
                                        <p className="text-sm text-gray-600">Date: {deleteConfirm.date}</p>
                                        <p className="text-sm text-gray-600">Time: {deleteConfirm.time}</p>
                                        <p className="text-sm text-gray-600">Status: {deleteConfirm.status}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
}

export default SearchPage;
