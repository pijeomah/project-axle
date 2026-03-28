import { } from 'react'
import{ BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import './App.css'


function App() {
  return(
    <BrowserRouter>
    <Routes>
      {/* Public Routes */}
       <Route path="/login" element={<Login/>} />

       <Route path="/signup" element={<Signup/>}/>
       {/* Protected Routes */}
       <Route path="/dashboard"element={
        <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
           
          </ProtectedRoute>}
       />  

    </Routes>
    </BrowserRouter>
  )

  
}

export default App
