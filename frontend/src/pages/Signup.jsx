// Signup.jsx

import React, { useState }  from "react";
import {useAuth} from '../context/AuthContext'
import { useNavigate} from 'react-router-dom'


const SignupPage = ()=> {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { signUp} = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async(e)=> {
        e.preventDefault()
        setError('')
        if(!email || !password){
            setError('Please fill in all the fields')
            return
        }
         setLoading(true)
    try {
        const data = await signUp(email, password)
        if(data.error){
            setError(data.error)
        }else{
            navigate('/dashboard')
        }
    } catch (error) {
        setError(`An unexpected error occurred`)
    }finally{
        setLoading(false)
    }}

return (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Create Account
      </h1>
      <p className="text-sm text-center text-gray-500 mb-6">
     Manage your finances properly.
      </p>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:border-indigo-500 transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:border-indigo-500 transition duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg 
                     hover:bg-indigo-700 disabled:opacity-50 
                     disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

      </form>

      <p className="text-sm text-center text-gray-500 mt-6">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-indigo-600 hover:underline cursor-pointer"
        >
          Login
        </span>
      </p>

    </div>
  </div>
)
}

export default SignupPage