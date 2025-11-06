import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import TestConnection from './pages/TestConnection';

function App() {
  return (
    <Router>
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
          <Route path="/test" element={<TestConnection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
