import { useState } from 'react'
import{ BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Transactions from './pages/Transactions'
import './App.css'
import Settings from './pages/Settings'


const RootRedirect  = () => {
  const { user } = useAuth()
  return <Navigate to={user? 'dashboard' : 'login'} replace/>
}
function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  return(
    <BrowserRouter>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRedirect/>} />
       <Route path="/login" element={<Login/>} />

       <Route path="/signup" element={<Signup/>}/>
       {/* Protected Routes */}
       <Route path="/dashboard" element={
        <ProtectedRoute>
             <Layout onTransactionCreated={() => setRefreshKey(k => k + 1)}>
              <Dashboard key={refreshKey} />
            </Layout>
           
          </ProtectedRoute>}
       />  
       <Route path="/transactions"element={
        <ProtectedRoute>
            <Layout onTransactionCreated={() => setRefreshKey(k => k + 1)}>
              <Transactions key={refreshKey} />
            </Layout>
           
          </ProtectedRoute>}
       />  

        <Route path="/settings"element={
        <ProtectedRoute>
            <Layout onTransactionCreated={() => setRefreshKey(k => k + 1)}>
              <Settings/>
            </Layout>
           
          </ProtectedRoute>}
       />  
    </Routes>
    </BrowserRouter>
  )

  
}

export default App
