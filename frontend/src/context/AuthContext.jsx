import React, { createContext,useState,useEffect,useContext } from 'react'
// import {supabase} from '../services/supabase'

const AuthContext = createContext({})
const BASE_URL = import.meta.env.VITE_API_URL

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)


useEffect(()=> {
   const validateSession = async () => {
    const token = localStorage.getItem('axle-token')
    if(!token){
        setLoading(false)
        return
    }

    try {
        const response = await fetch (`${BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type' : 'application/json'

            }
        })
        if(response.ok){
            const data = await response.json()
            setUser(data.user)
        }else{
            localStorage.removeItem('axle-token')
            setUser(null)

        }
    } catch (error) {
        console.error("Auth validation failed:", error)
        setUser(null)
    }finally{
        setLoading(false)
    }
   }

   validateSession()
}, [])

    const signUp = async(email, password ) =>{
        const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
        })
        const data = await response.json()
        if(response.ok){
            localStorage.setItem('axle-token', data.token)
            setUser(data.user)

        }

        return data
    }

     const signIn = async(email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email,password})
    })
         const data = await response.json()
         if(response.ok){
            localStorage.setItem('axle-token', data.token)
            setUser(data.user)
         }
        return data
    }

    const signOut = async()=>{
        localStorage.removeItem('axle-token')
        setUser(null)

    }
    const value = {
        user, 
        signUp, 
        signIn,
        signOut, 
        loading
    }

   

    return (
        <AuthContext.Provider value ={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=> {
    return useContext(AuthContext)
}