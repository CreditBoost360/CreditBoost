import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './pages/Login'
import './App.css'
import SignUp from './pages/SignUp'
import LandingPage from './pages/LandingPage'
import { AppProvider } from './context/AppContext'
import VerifyEmail from './pages/EmailVerify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import GoogleAuth from './pages/GoogleAuth'
import Communities from './pages/Communities'
import CommunityPage from './pages/CommunityPage'
import CreditScore from './pages/CreditScore'
import UploadData from './pages/UploadData'
import PrivateRoute from './middleware/PrivateRoute'
import AdminRoute from './middleware/AdminRoute'
import Learn from './pages/Academy/Learn'
import Quiz from './pages/Academy/Quiz'
import TopicQuizzes from './pages/Academy/TopicQuizzes'
import AccountSetting from './pages/AccountSetting'
import Games from './pages/Games'
import TransactionDashboard from './pages/TransactionDashboard'
import CreditDataView from './pages/CreditDataView'
import DataChatInterface from './pages/DataChatInterface'
import MicroFinance from './pages/MicroFinance/MicroFinance'
import CreditPassport from './pages/CreditPassport'
import { Toaster } from './components/ui/toaster'

// Admin Routes
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import Level6Bridge from './pages/admin/Level6Bridge'
import AdminDeactivation from './pages/admin/AdminDeactivation'
import SecureArea from './pages/admin/SecureArea'

// Transparency System
import TransparencyPortal from './pages/transparency/TransparencyPortal'
import BridgeActivityLog from './pages/transparency/BridgeActivityLog'
import AdminActionVerifier from './pages/transparency/AdminActionVerifier'
import SecurityAlertSubscription from './pages/transparency/SecurityAlertSubscription'

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google-auth" element={<GoogleAuth />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
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
            <Route path="/transactions" element={<TransactionDashboard />} />
            <Route path="/credit-data" element={<CreditDataView />} />
            <Route path="/data-chat" element={<DataChatInterface />} />
            <Route path="/micro-finance" element={<MicroFinance />} />
            <Route path="/credit-passport" element={<CreditPassport />} />
            
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
        </Routes>
        <Toaster />
      </AppProvider>
    </Router>
  )
}

export default App