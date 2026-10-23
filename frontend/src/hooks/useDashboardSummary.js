import { useState, useEffect } from "react";
import apiFetch from "../services/api";

const useDashboardSummary = ()=> {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [ error, setError] = useState(null)
        useEffect(() => {
    const fetchSummary = async()=>{
        try {
            const result = await apiFetch('/dashboard/summary')
            setData(result)
        } catch (err) {
            setError(err.message)  
        }
        finally{
            setLoading(false)

        }

    }
    fetchSummary()
},[])

    return{data, loading, error}
}

export default useDashboardSummary
