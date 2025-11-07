import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-primary-500">{user?.username}</span>! 👋
          </h1>
          <p className="text-gray-400">Ready to battle?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-400 mb-1">Rating</div>
            <div className="text-3xl font-bold text-primary-500">{user?.rating}</div>
          </div>
          
          <div className="card">
            <div className="text-sm text-gray-400 mb-1">Total XP</div>
            <div className="text-3xl font-bold text-secondary-500">{user?.xp}</div>
          </div>
          
          <div className="card">
            <div className="text-sm text-gray-400 mb-1">Wins</div>
            <div className="text-3xl font-bold text-green-500">{user?.stats?.wins}</div>
          </div>
          
          <div className="card">
            <div className="text-sm text-gray-400 mb-1">Total Matches</div>
            <div className="text-3xl font-bold text-blue-500">{user?.stats?.totalMatches}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Quick Battle</h2>
            <p className="text-gray-400 mb-6">
              Jump into a random match with an opponent at your skill level
            </p>
            <button className="btn-primary w-full">
              Find Match
            </button>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Practice Mode</h2>
            <p className="text-gray-400 mb-6">
              Sharpen your skills with practice problems
            </p>
            <button className="btn-secondary w-full">
              Start Practice
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p>No recent matches yet. Start your first battle!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
