import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/quick-start">
              Quick Start
            </NavLink>
          </li>
          <li>
            <NavLink to="/api-docs">
              API Documentation
            </NavLink>
          </li>
          <li>
            <NavLink to="/authentication">
              Authentication
            </NavLink>
          </li>
          <li>
            <NavLink to="/sdk-docs">
              SDK Documentation
            </NavLink>
          </li>
          <li>
            <NavLink to="/samples">
              Code Samples
            </NavLink>
          </li>
          <li>
            <NavLink to="/access-explained">
              API Access Explained
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <a href="https://github.com/creditboost/api-sdk" target="_blank" rel="noopener noreferrer" className="sidebar-link">
          GitHub
        </a>
        <a href="mailto:api-support@creditboost.co.ke" className="sidebar-link">
          Support
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;

