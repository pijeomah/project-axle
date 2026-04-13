const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v2"

const getToken = ()=> localStorage.getItem('axle-token')

const apiFetch = async(endpoint, options = {})=> {
    const { method ='GET', body} = options
        const config = {
            method,
            headers: {
                 'Authorization': `Bearer ${getToken()}`,
                'Content-Type' : `application/json`
            }
        }

        if(body) config.body = JSON.stringify(body)

        try {
             const response = await fetch(`${BASE_URL}${endpoint}`, config)
        if(!response.ok){
            const errorData = await response.json().catch(() =>({}))
            throw new Error(errorData?.error || 'Request failed')
        }
        return await response.json()
        } catch (error) {
           console.error("API Fetch Error:", error.message);
            throw error;
        }
       

    
}



export default apiFetch