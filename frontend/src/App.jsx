import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import QuestionForm from './pages/QuestionForm';
import Matchmaking from './pages/Matchmaking';
import BattleRoom from './pages/BattleRoom';
import TestConnection from './pages/TestConnection';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test" element={<TestConnection />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions/:id" element={<QuestionDetail />} />
            <Route
              path="/matchmaking"
              element={
                <ProtectedRoute>
                  <Matchmaking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/battle/:battleId"
              element={
                <ProtectedRoute>
                  <BattleRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/questions/new"
              element={
                <ProtectedRoute>
                  <QuestionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/questions/edit/:id"
              element={
                <ProtectedRoute>
                  <QuestionForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
