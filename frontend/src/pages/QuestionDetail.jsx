import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const response = await apiService.getQuestion(id);
      setQuestion(response.data);
    } catch (error) {
      console.error('Fetch question error:', error);
      toast.error('Failed to load question');
      navigate('/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await apiService.deleteQuestion(id);
      toast.success('Question deleted successfully');
      navigate('/questions');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete question');
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
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-400">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/questions" className="text-primary-500 hover:text-primary-400 mb-4 inline-block">
            ← Back to Questions
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{question.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty.toUpperCase()}
                </span>
              </div>
              
              {question.tags && question.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {question.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-700 rounded-lg text-sm text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Link
                  to={`/admin/questions/edit/${id}`}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex gap-4 border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === 'description'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === 'examples'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Examples
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === 'testcases'
                  ? 'text-primary-500 border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Test Cases ({question.testCases?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Problem Statement</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{question.description}</p>
              </div>
              
              {question.constraints && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Constraints</h3>
                  <pre className="text-gray-300 bg-gray-900 p-4 rounded-lg">{question.constraints}</pre>
                </div>
              )}
              
              {question.hints && question.hints.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Hints</h3>
                  <ul className="space-y-2">
                    {question.hints.map((hint, idx) => (
                      <li key={idx} className="text-gray-300 flex gap-2">
                        <span className="text-primary-500">💡</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-4">
              {question.examples && question.examples.length > 0 ? (
                question.examples.map((example, idx) => (
                  <div key={idx} className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-bold text-primary-500 mb-2">Example {idx + 1}</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400">Input: </span>
                        <code className="text-green-400">{example.input}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Output: </span>
                        <code className="text-blue-400">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-gray-400">Explanation: </span>
                          <span className="text-gray-300">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No examples available</p>
              )}
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="space-y-4">
              {question.testCases && question.testCases.length > 0 ? (
                question.testCases.map((testCase, idx) => (
                  <div key={idx} className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-primary-500">Test Case {idx + 1}</h4>
                      {testCase.isHidden && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400">Input: </span>
                        <code className="text-green-400">{testCase.input}</code>
                      </div>
                      <div>
                        <span className="text-gray-400">Expected Output: </span>
                        <code className="text-blue-400">{testCase.expectedOutput}</code>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No test cases available</p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="card text-center">
          <button className="btn-primary text-lg px-8 py-3">
            Start Coding Challenge →
          </button>
          <p className="text-gray-400 mt-3 text-sm">
            Battle mode coming in Phase 4!
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
