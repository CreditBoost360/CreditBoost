import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { Toaster } from './components/ui/toaster'
import './App.css'

// Error Boundary Component for lazy-loaded routes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

// Middleware
import PrivateRoute from './middleware/PrivateRoute'
import AdminRoute from './middleware/AdminRoute'

// Loading component for lazy-loaded routes
import LoadingScreen from './components/Common/LoadingScreen'

// Public routes - eagerly loaded
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/EmailVerify'
import GoogleAuth from './pages/GoogleAuth'

// Lazy-loaded routes for better performance
const Home = lazy(() => import('./pages/Home'))
const Communities = lazy(() => import('./pages/Communities'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const CreditScore = lazy(() => import('./pages/CreditScore'))
const UploadData = lazy(() => import('./pages/UploadData'))
const Learn = lazy(() => import('./pages/Academy/Learn'))
const Quiz = lazy(() => import('./pages/Academy/Quiz'))
const TopicQuizzes = lazy(() => import('./pages/Academy/TopicQuizzes'))
const AccountSetting = lazy(() => import('./pages/AccountSetting'))
const Games = lazy(() => import('./pages/Games'))
// Fix the TransactionDashboard import with more explicit path and error handling
const TransactionDashboard = lazy(() => 
  import(/* webpackChunkName: "transaction-dashboard" */ '@/pages/TransactionDashboard')
    .catch(error => {
      console.error("Failed to load TransactionDashboard:", error);
      return { default: () => <div>Failed to load Transactions Dashboard. Please refresh the page.</div> };
    })
)
const CreditDataView = lazy(() => import('./pages/CreditDataView'))
const DataChatInterface = lazy(() => import('./pages/DataChatInterface'))
const MicroFinance = lazy(() => import('./pages/MicroFinance/MicroFinance'))
const CreditPassport = lazy(() => import('./pages/CreditPassport'))
const FinancialDashboard = lazy(() => import('./pages/FinancialDashboard'))
const DataConnectionPage = lazy(() => import('./pages/DataConnectionPage'))

// Admin routes - lazy loaded
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const Level6Bridge = lazy(() => import('./pages/admin/Level6Bridge'))
const AdminDeactivation = lazy(() => import('./pages/admin/AdminDeactivation'))
const SecureArea = lazy(() => import('./pages/admin/SecureArea'))

// Transparency System - lazy loaded
const TransparencyPortal = lazy(() => import('./pages/transparency/TransparencyPortal'))
const BridgeActivityLog = lazy(() => import('./pages/transparency/BridgeActivityLog'))
const AdminActionVerifier = lazy(() => import('./pages/transparency/AdminActionVerifier'))
const SecurityAlertSubscription = lazy(() => import('./pages/transparency/SecurityAlertSubscription'))

// Error pages
const NotFound = lazy(() => import('./pages/Errors/NotFound'))
const ServerError = lazy(() => import('./pages/Errors/ServerError'))

function App() {
  return (
    <Router>
      <AppProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/google-auth" element={<GoogleAuth />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/community/:id" element={<CommunityPage />} />
              <Route path="/credit-score" element={<CreditScore />} />
              <Route path="/upload-data" element={<UploadData />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/quiz/:id" element={<Quiz />} />
              <Route path="/topic-quizzes/:id" element={<TopicQuizzes />} />
              <Route path="/account-settings" element={<AccountSetting />} />
              <Route path="/games" element={<Games />} />
              <Route path="/transactions" element={
                <ErrorBoundary fallback={<div className="p-8 text-center">
                  <h2 className="text-xl font-bold mb-2">Failed to load Transactions Dashboard</h2>
                  <p className="mb-4">There was an error loading this component</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-primary text-white rounded-md">
                    Retry
                  </button>
                </div>}>
                  <TransactionDashboard />
                </ErrorBoundary>
              } />
              <Route path="/credit-data" element={<CreditDataView />} />
              <Route path="/data-chat" element={<DataChatInterface />} />
              <Route path="/micro-finance" element={<MicroFinance />} />
              <Route path="/credit-passport" element={<CreditPassport />} />
              <Route path="/financial-dashboard" element={<FinancialDashboard />} />
              <Route path="/connect-data" element={<DataConnectionPage />} />
              
              {/* Transparency Portal - accessible to regular users */}
              <Route path="/transparency" element={<TransparencyPortal />} />
              <Route path="/transparency/bridge-log" element={<BridgeActivityLog />} />
              <Route path="/transparency/verify-action" element={<AdminActionVerifier />} />
              <Route path="/transparency/alerts" element={<SecurityAlertSubscription />} />
            </Route>
            
            {/* Admin Login - Public */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Standard Admin Routes - Level 1+ */}
            <Route element={<AdminRoute requiredLevel={1} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
            
            {/* Level 6 Admin Routes */}
            <Route element={<AdminRoute requiredLevel={6} />}>
              <Route path="/admin/level6-bridge" element={<Level6Bridge />} />
              <Route path="/admin/admin-deactivation" element={<AdminDeactivation />} />
            </Route>
            
            {/* Ultra-Secure Area - Level 6 + Bridge Authentication */}
            <Route element={<AdminRoute requiredLevel={6} />}>
              <Route path="/admin/secure-area" element={<SecureArea />} />
            </Route>
            
            {/* Error Routes */}
            <Route path="/server-error" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AppProvider>
    </Router>
  )
}

export default App