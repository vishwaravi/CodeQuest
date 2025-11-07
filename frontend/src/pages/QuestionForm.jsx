import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';

const QuestionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: '',
    constraints: '',
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    examples: [{ input: '', output: '', explanation: '' }],
    hints: [''],
    starterCode: {
      javascript: '',
      python: '',
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await apiService.getQuestion(id);
      const q = response.data;
      
      setFormData({
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        tags: q.tags?.join(', ') || '',
        constraints: q.constraints || '',
        timeLimit: q.timeLimit || 2000,
        memoryLimit: q.memoryLimit || 256,
        testCases: q.testCases || [{ input: '', expectedOutput: '', isHidden: false }],
        examples: q.examples || [{ input: '', output: '', explanation: '' }],
        hints: q.hints || [''],
        starterCode: q.starterCode || { javascript: '', python: '' },
      });
    } catch (error) {
      console.error('Fetch question error:', error);
      toast.error('Failed to load question');
      navigate('/questions');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', expectedOutput: '', isHidden: false }],
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    if (formData.testCases.length === 0 || !formData.testCases[0].input) {
      toast.error('At least one test case is required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (isEditMode) {
        await apiService.updateQuestion(id, submitData);
        toast.success('Question updated successfully');
      } else {
        await apiService.createQuestion(submitData);
        toast.success('Question created successfully');
      }
      
      navigate('/questions');
    } catch (error) {
      console.error('Submit error:', error);
      const message = error.response?.data?.error || 'Failed to save question';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">
          {isEditMode ? 'Edit Question' : 'Create New Question'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Two Sum"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[150px]"
                  placeholder="Detailed problem description..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="input"
                    placeholder="array, hash-table, sorting"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Test Cases *</h2>
              <button type="button" onClick={addTestCase} className="btn-primary">
                + Add Test Case
              </button>
            </div>

            <div className="space-y-4">
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-primary-500">Test Case {index + 1}</h3>
                    {formData.testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Input</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        className="input min-h-[60px]"
                        placeholder="[2,7,11,15]\n9"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1">Expected Output</label>
                      <input
                        type="text"
                        value={testCase.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        className="input"
                        placeholder="[0,1]"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={testCase.isHidden}
                        onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label className="text-sm">Hidden (not shown to users)</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Constraints</label>
                <textarea
                  name="constraints"
                  value={formData.constraints}
                  onChange={handleChange}
                  className="input min-h-[80px]"
                  placeholder="1 <= nums.length <= 10^4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Time Limit (ms)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    className="input"
                    min="100"
                    max="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Memory Limit (MB)</label>
                  <input
                    type="number"
                    name="memoryLimit"
                    value={formData.memoryLimit}
                    onChange={handleChange}
                    className="input"
                    min="64"
                    max="1024"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Question' : 'Create Question'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/questions')}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
