import  supabase  from '../config/supabase.js'

// 1. SIGNUP (Create a new user)
export const signup = async (req, res) => {
    const { email, password } = req.body

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) throw error

        res.status(201).json(data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// Validate sessions
export const me = async (req, res) => {
    return res.status(200).json({ user: req.user })
}

// 2. LOGIN (Get the Token)
export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error
            console.log("ACCESS TOKEN:", data.session.access_token?.substring(0, 20))

        // Send back the user AND the session (which contains the access_token)
        res.status(200).json({ 
            user: data.user, 
            token: data.session.access_token 
        }
        
    )
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}