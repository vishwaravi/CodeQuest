import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6">
            <span className="text-white">Welcome to </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">
              CodeQuest
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Battle other developers in real-time coding challenges. 
            Write code, pass tests, and claim victory! ⚔️
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-3">
              Start Battle
            </button>
            <Link to="/test" className="btn-outline text-lg px-8 py-3">
              Test Connection
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-white">Real-Time Battles</h3>
            <p className="text-gray-400">
              Face opponents live with synchronized code editors and instant feedback.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2 text-white">Smart Matchmaking</h3>
            <p className="text-gray-400">
              Get paired with developers at your skill level for fair competition.
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2 text-white">Climb the Ranks</h3>
            <p className="text-gray-400">
              Win battles, earn XP, and dominate the global leaderboard.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">1000+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-500 mb-2">5000+</div>
              <div className="text-gray-400">Battles Fought</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-500 mb-2">50+</div>
              <div className="text-gray-400">Coding Challenges</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-500 mb-2">24/7</div>
              <div className="text-gray-400">Always Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
