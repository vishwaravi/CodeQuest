import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Questions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    search: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  useEffect(() => {
    // Debug: Log user data to check role
    if (user) {
      console.log('👤 Current User:', user);
      console.log('🔑 User Role:', user.role);
    }
  }, [user]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await apiService.getQuestions(filters);
      setQuestions(response.data);
    } catch (error) {
      console.error('Fetch questions error:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'hard':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Coding Problems</h1>
            <p className="text-gray-400">Choose a challenge and start coding!</p>
          </div>
          
          {user?.role === 'admin' && (
            <Link to="/admin/questions/new" className="btn-primary">
              + Add Question
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by title..."
                className="input"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                className="input"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-400">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <p className="text-gray-400 text-lg">No questions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <Link
                key={question._id}
                to={`/questions/${question._id}`}
                className="card block hover:border-primary-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white hover:text-primary-500">
                        {question.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3 line-clamp-2">
                      {question.description.substring(0, 150)}...
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-2">
                          {question.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {question.usageCount > 0 && (
                        <span className="text-gray-500">
                          🎯 Used {question.usageCount} times
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="text-primary-500">→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
