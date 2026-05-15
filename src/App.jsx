import TermsPage from './pages/TermsPage'
import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)

  const logout = () => {
    setUser(null)
    setPage('home')
  }

  const renderPage = () => {
    switch (page) {
      case 'login':     return <LoginPage setPage={setPage} setUser={setUser} />
      case 'register':  return <RegisterPage setPage={setPage} setUser={setUser} />
      case 'browse':    return <BrowsePage user={user} setPage={setPage} />
      case 'dashboard': return <DashboardPage user={user} setPage={setPage} />
      default:          return <HomePage setPage={setPage} />
    }
  }

  const hideNav = ['login', 'register'].includes(page)

  return (
    <div>
      {!hideNav && (
        <Navbar
          user={user}
          setPage={setPage}
          logout={logout}
          page={page}
        />
      )}
      {renderPage()}
    </div>
  )
}