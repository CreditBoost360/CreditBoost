import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

/**
 * Layout component for admin pages.
 * Provides consistent layout with sidebar and header.
 */
const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        setLoading(true);
        
        // Verify admin authentication
        const response = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Authentication failed');
        }
        
        const adminData = await response.json();
        setAdminUser(adminData);
        
        setLoading(false);
      } catch (err) {
        console.error("Admin authentication error:", err);
        setError("Authentication failed. Please log in again.");
        setLoading(false);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    };
    
    verifyAdmin();
    
    // Check for preferred theme
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [navigate]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      });
      
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-bridge-token');
      
      navigate('/admin/login');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <AdminSidebar 
        darkMode={darkMode} 
        adminUser={adminUser} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <AdminHeader 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          adminUser={adminUser}
          onLogout={handleLogout}
          toggleMobileMenu={toggleMobileMenu}
        />
        
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;