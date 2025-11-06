import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl">⚔️</div>
              <span className="text-xl font-bold text-white">
                Code<span className="text-primary-500">Quest</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/test"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Test
            </Link>
            <button className="btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
