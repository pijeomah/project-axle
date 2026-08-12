// LoginPage

import  React, { useState }  from "react";
import {useAuth} from '../context/AuthContext'
import {useNavigate} from 'react-router-dom'




const LoginPage = ()=>{
    const {signIn} = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading ] = useState(false)
    const [error, setError] = useState('')
   

    const handleSubmit = async(e)=>{
        e.preventDefault()
        setError('')
        if(!email || !password){
        setError('Please fill in all fields')
        return
        }
        setLoading(true)

        try {
            const data = await signIn(email, password)
            if(data.error){
                setError(data.error)

            }else{
                navigate('/dashboard')
            }
        } catch (error) {
            setError("An unexpected error occurred")
        }finally{
            setLoading(false)
        }
    }

return (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Welcome Back
      </h1>
      <p className="text-sm text-center text-gray-500 mb-6">
        Access your finances.
      </p>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-indigo-500 transition duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-indigo-500 transition duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#1A3C34', hover: '#1A3C34' }}
          className="w-full text-white py-2.5 rounded-lg
                     hover:bg-indigo-700 disabled:opacity-50
                     disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form> 

      <p className="text-sm text-center text-gray-500 mt-6">
        Do not have an account?{" "}
        <span
        style={{ color: '#1A3C34'}}
          onClick={() => navigate("/signup")}
          className="text-indigo-600 hover:underline cursor-pointer"
        >
          Sign Up
        </span>
      </p>

    </div>
  </div>
);
}

export default LoginPage