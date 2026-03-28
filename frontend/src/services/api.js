const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v2"

const getToken = ()=> localStorage.getItem('axle-token')

const apiFetch = async(endpoint)=> {

        try {
             const response = await fetch(`${BASE_URL}${endpoint}`,{
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type' : `application/json`
            }
        })
        if(!response.ok){
            const error = await response.json()
            throw new Error(error?.error || 'Request failed')
        }
        return response.json()
        } catch (error) {
            throw Error
        }
       

    
}



export default apiFetch