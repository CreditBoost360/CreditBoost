import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Sidebar from './components/layout/Sidebar'
import HomePage from './pages/HomePage'
import ApiDocsPage from './pages/ApiDocsPage'
import AuthenticationPage from './pages/AuthenticationPage'
import QuickStartPage from './pages/QuickStartPage'
import SdkDocsPage from './pages/SdkDocsPage'
import SamplesPage from './pages/SamplesPage'
import AccessExplainedPage from './pages/AccessExplained'
import './styles/App.scss'

function App() {
  return (
    <div className="app">
      <Header />
      <div className="content-wrapper">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/authentication" element={<AuthenticationPage />} />
            <Route path="/quick-start" element={<QuickStartPage />} />
            <Route path="/sdk-docs" element={<SdkDocsPage />} />
            <Route path="/samples" element={<SamplesPage />} />
            <Route path="/access-explained" element={<AccessExplainedPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default App

