// Dashboard

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {useNavigate} from 'react-router-dom'

const Dashboard = ()=>{

    const { user, signOut} = useAuth()
    const navigate = useNavigate()
    const [isLoggingOut, setIsLoggingOut ] = useState(false)

const handleLogout = async()=> {
    setIsLoggingOut(true)
                 try {
        await signOut()
        navigate('/login')

    } 
    catch (error) {
        console.log('Error logging out', error)
        setIsLoggingOut(false)
    }
}
   if(loading){
    return <div>Loading...</div>

   }
    if(!user){
        return <div>User not authenticated</div>
    }
    return(
        <div>
            <h1>
                Dashboard
            </h1>
            <h2>
                Welcome {user?.email || 'User'}
            </h2>

            <button type="submit" onClick={handleLogout} disabled={isLoggingOut}>{setIsLoggingOut ? 'Logging out...' : 'Logged Out'}</button>
            
        </div>
    )
}

export default Dashboard