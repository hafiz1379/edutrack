import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Classes', to: 'classes' },
    { name: 'Students', to: 'students' },
    { name: 'Teachers', to: 'teachers' },
    { name: 'Fee Payments', to: 'fees' },
    { name: 'Teacher Salaries', to: 'salaries' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">School Management</h1>
        <div className="flex items-center space-x-4">
          <span className="font-medium">Welcome, {auth.role === 'super' ? 'Super Admin' : 'Sub Admin'}</span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded shadow"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg flex-shrink-0 overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Menu</h2>
            <p className="text-gray-500 text-sm">Quick links to manage school data</p>
          </div>
          <ul className="mt-4">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`block px-6 py-3 rounded-lg mb-2 transition flex items-center font-medium ${
                    location.pathname.includes(item.to)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to the Dashboard</h1>
            <p className="text-gray-600">
              Hello, {auth.role === 'super' ? 'Super Admin' : 'Sub Admin'}! Here's an overview of your school.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Students</h3>
              <p className="text-3xl font-bold text-blue-600">125</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Teachers</h3>
              <p className="text-3xl font-bold text-green-600">32</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Classes</h3>
              <p className="text-3xl font-bold text-purple-600">12</p>
            </div>
          </div>

          {/* Nested Routes */}
          <div className="bg-white rounded-lg shadow p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
