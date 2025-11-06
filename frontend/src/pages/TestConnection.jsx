import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';
import socketService from '../services/socket';

const TestConnection = () => {
  const [apiStatus, setApiStatus] = useState('idle');
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [apiData, setApiData] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState(null);

  // Test API connection
  const testApiConnection = async () => {
    setApiStatus('loading');
    try {
      const healthData = await apiService.healthCheck();
      const testData = await apiService.testApi();
      
      setApiData({ health: healthData, test: testData });
      setApiStatus('success');
      toast.success('✅ API connection successful!');
    } catch (error) {
      console.error('API Error:', error);
      setApiStatus('error');
      toast.error('❌ API connection failed!');
    }
  };

  // Test Socket connection
  const testSocketConnection = () => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setSocketStatus('connected');
      setSocketId(socket.id);
      toast.success('⚡ Socket connected!');
    });

    socket.on('welcome', (data) => {
      setWelcomeMessage(data);
      toast.success('👋 Received welcome message!');
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
      setSocketId(null);
      toast.error('🔴 Socket disconnected!');
    });
  };

  // Disconnect socket
  const disconnectSocket = () => {
    socketService.disconnect();
    setSocketStatus('disconnected');
    setSocketId(null);
    setWelcomeMessage(null);
    toast('🔌 Socket disconnected manually');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🧪 Connection Test Suite
        </h1>

        {/* API Test Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">REST API Test</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              apiStatus === 'success' ? 'bg-green-500/20 text-green-400' :
              apiStatus === 'error' ? 'bg-red-500/20 text-red-400' :
              apiStatus === 'loading' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {apiStatus === 'success' ? '✅ Connected' :
               apiStatus === 'error' ? '❌ Failed' :
               apiStatus === 'loading' ? '⏳ Testing...' :
               '⚪ Not Tested'}
            </div>
          </div>

          <button
            onClick={testApiConnection}
            disabled={apiStatus === 'loading'}
            className="btn-primary w-full mb-4"
          >
            {apiStatus === 'loading' ? 'Testing...' : 'Test API Connection'}
          </button>

          {apiData && (
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Socket Test Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Socket.io Test</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              socketStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {socketStatus === 'connected' ? '⚡ Connected' : '🔴 Disconnected'}
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={testSocketConnection}
              disabled={socketStatus === 'connected'}
              className="btn-primary flex-1"
            >
              Connect Socket
            </button>
            <button
              onClick={disconnectSocket}
              disabled={socketStatus !== 'connected'}
              className="btn bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              Disconnect
            </button>
          </div>

          {socketId && (
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Socket ID:</div>
                <div className="text-primary-400 font-mono">{socketId}</div>
              </div>

              {welcomeMessage && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Welcome Message:</div>
                  <pre className="text-sm text-green-400">
                    {JSON.stringify(welcomeMessage, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card mt-8 bg-primary-900/20 border-primary-500/30">
          <h3 className="text-xl font-bold mb-3 text-primary-400">📝 Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Make sure MongoDB is running locally</li>
            <li>Start the backend server (npm run dev in backend folder)</li>
            <li>Click "Test API Connection" to verify REST endpoints</li>
            <li>Click "Connect Socket" to test real-time communication</li>
            <li>Check browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
