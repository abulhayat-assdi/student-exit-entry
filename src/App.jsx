import { useState, useEffect } from 'react';
import { Calendar, User, LogOut, LogIn, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { findStudentByRoll } from './data/students';
import { addLog as addLogToFirestore, subscribeToLogs } from './services/firestoreService';
import { initializeStudentsDatabase } from './services/studentService';
import { studentsDatabase } from './data/students';
import SearchPage from './components/SearchPage';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'search'
  const [date, setDate] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [batch, setBatch] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set current date and initialize Firestore on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    // Initialize students database in Firestore
    initializeStudentsDatabase(studentsDatabase).catch(error => {
      console.error('Error initializing students database:', error);
    });

    // Subscribe to real-time log updates
    loadLogsFromFirestore();
  }, []);

  // Load logs from Firestore with real-time updates
  const loadLogsFromFirestore = () => {
    setIsLoading(true);
    try {
      const unsubscribe = subscribeToLogs((logs) => {
        setRecentLogs(logs);
        setIsLoading(false);
        console.log('Real-time update: received', logs.length, 'logs from Firestore');
      });

      // Cleanup subscription on unmount
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      setIsLoading(false);

      // Fallback to localStorage
      const savedLogs = localStorage.getItem('studentLogs');
      if (savedLogs) {
        setRecentLogs(JSON.parse(savedLogs));
        console.log('Loaded logs from localStorage (fallback)');
      }
    }
  };

  // Auto-complete student name when roll number changes
  useEffect(() => {
    if (rollNo.trim()) {
      const student = findStudentByRoll(rollNo);
      if (student) {
        setStudentName(student.name);
        setBatch(student.batch || '');
        setShowWarning(false);
      } else {
        setStudentName('');
        setBatch('');
        setShowWarning(true);
      }
    } else {
      setStudentName('');
      setBatch('');
      setShowWarning(false);
    }
  }, [rollNo]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleLog = async (status) => {
    if (!rollNo.trim() || !studentName) {
      showNotification('Please enter a valid roll number', 'error');
      return;
    }

    const logData = {
      date,
      rollNo: rollNo.trim(),
      name: studentName,
      batch: batch,
      time: getCurrentTime(),
      status,
    };

    try {
      // Save to Firestore
      const logId = await addLogToFirestore(logData);
      console.log('Log saved to Firestore with ID:', logId);

      // Show success notification
      showNotification(
        `${studentName} logged ${status === 'OUT' ? 'exit' : 'entry'} successfully!`,
        'success'
      );

      // Reset form
      setRollNo('');
      setStudentName('');

      // Note: recentLogs will be automatically updated via real-time listener
    } catch (error) {
      console.error('Error saving log:', error);
      showNotification('Error saving log. Please try again.', 'error');

      // Fallback to localStorage
      try {
        const updatedLogs = [logData, ...recentLogs];
        localStorage.setItem('studentLogs', JSON.stringify(updatedLogs));
        setRecentLogs(updatedLogs);
        showNotification('Log saved locally (offline mode)', 'success');
      } catch (fallbackError) {
        console.error('Fallback save failed:', fallbackError);
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Render search page if selected
  if (currentPage === 'search') {
    return <SearchPage onBack={() => setCurrentPage('dashboard')} />;
  }

  // Render dashboard
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="mb-8 animate-fadeIn text-center">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Exit/Entry Management
            </h1>
            <p className="text-gray-600">
              Track and manage student movements efficiently
            </p>
          </div>

          {/* Navigation Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentPage('search')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg shadow-sm hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search className="w-5 h-5" />
              Search History
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 notification ${notification.type === 'success'
              ? 'bg-white border-l-4 border-primary text-gray-900'
              : 'bg-white border-l-4 border-error text-gray-900'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="professional-card p-8 mb-6 animate-scaleIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Log Entry
          </h2>

          {/* Date Picker */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-professional w-full px-4 py-2.5 rounded-lg text-gray-900 bg-white"
            />
          </div>

          {/* Roll Number Input */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 text-primary" />
              Roll Number
            </label>
            <input
              type="text"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="Enter roll number (e.g., 101)"
              className="input-professional w-full px-4 py-2.5 rounded-lg text-gray-900 bg-white placeholder:text-gray-400"
            />
            {showWarning && rollNo && (
              <p className="mt-2 text-sm text-warning flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4" />
                Student not found in database
              </p>
            )}
          </div>

          {/* Student Name (Auto-filled) */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 text-primary" />
              Student Name
            </label>
            <div
              className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all duration-200 ${studentName
                ? 'success-state animate-fadeIn'
                : 'border-gray-300 bg-gray-50 text-gray-500'
                }`}
            >
              {studentName || 'Name will appear automatically'}
            </div>
          </div>

          {/* Batch Number (Auto-filled) */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 text-primary" />
              Batch Number
            </label>
            <div
              className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all duration-200 ${batch
                ? 'success-state animate-fadeIn'
                : 'border-gray-300 bg-gray-50 text-gray-500'
                }`}
            >
              {batch || 'Batch will appear automatically'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleLog('OUT')}
              disabled={!studentName}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log Exit (Going Out)
            </button>
            <button
              onClick={() => handleLog('IN')}
              disabled={!studentName}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Log Entry (Coming In)
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        {(() => {
          const filteredLogs = recentLogs.filter(log => log.date === date);
          return filteredLogs.length > 0 && (
            <div className="professional-card p-8 animate-slideUp">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Activity - {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="space-y-3">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-light hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.status === 'OUT'
                          ? 'bg-red-100 text-error'
                          : 'bg-primary-pale text-primary'
                          }`}
                      >
                        {log.status === 'OUT' ? (
                          <LogOut className="w-5 h-5" />
                        ) : (
                          <LogIn className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{log.name}</p>
                        <p className="text-sm text-gray-600">Roll: {log.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{log.time}</p>
                      <span
                        className={`inline-block mt-1 badge ${log.status === 'OUT'
                          ? 'badge-error'
                          : 'badge-success'
                          }`}
                      >
                        {log.status === 'OUT' ? 'Exit' : 'Entry'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default App;
