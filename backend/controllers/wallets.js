import supabase from '../config/supabase.js'
// PSEUDO for list
// export controller function using an async function
// create a try catch block
// capture the user id from the auth middleware 
// request a list of all wallets for this particular user 
// handle all errors 

export const list = async(req, res) => {
    
    try {
        const userId = req.user.id 
        const {data:listData, error} = await supabase
            .from('wallets')
            .select('id, type, name')
            .eq('user_id', userId)
            .order('id',{ascending: true})
            if(error) throw error
            return res.status(200).json({listData})

    } catch (error) {
        console.error(error.message)
        res.status(500).json({error: `Internal Server Error`})
    }
}

// capture the data from request body
// check to make sure that the type of wallet is correct
// normalize inputs 
// check to make usre nthere are no existing wallet
// block user from making a system wallet


export const create = async(req,res) => {
    try {
        const userId = req.user.id
        const { name, type } = req.body
        if(!name || !type){
            return res.status(400).json({error: `Wallet name and type are required`}) 
        }
            const normalizedName = name.toLowerCase().trim()
            
        const {data: existingWallet, error} = await supabase 
            .from('wallets')
            .select('id, is_active')
            .eq('user_id', userId )
            .eq('name', normalizedName)
            .eq('type', type)
            .maybeSingle()
            if(error) throw error
            

            if(existingWallet)
                if(existingWallet.is_active){
                    return res.status(409).json({
                        error: `Wallet already exists`
                    })
                }
        

        const {data:newWallet , error: walletError} = await supabase 
            .from('wallets')    
            .insert({
            'user_id': userId,
            name: normalizedName, 
            type,
            is_active: true
            })
            .select()
            .single()
            if(walletError) throw walletError

      return  res.status(201).json({newWallet})
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({error: `Internal server error occured`})
    }
}

// export controller
// capture the user id for security
// capture what is to be updated
// check if what is to be updated already exists
// capture wallet id
// normalize your inputs
// update the wallet if it passes all checks

export const update = async(req,res) => {
    try {
        const userId = req.user.id
        const walletId = req.params.id
        const { name, type} = req.body
        const normalizedName = name.toLowerCase().trim() 

        if(!normalizedName || !type){
            return res.status(400).json({error: `Name and type are required`})

        }


        const { data: existingWallet, error } = await supabase
        .from('wallets')
        .select('id', type)
        .eq('user_id', req.user.id)
        .eq('name', normalizedName)
        .eq('type', type)
        .eq('is_active', true)
        .neq('id', walletId)
        .maybeSingle();

      if(error){
            throw error 
        }

        if(existingWallet){
            if(existingWallet.is_active){
                return res.status(409).json({
                    error: `Wallet already exists`
                })
            }}

            const {data: updateData, error: updateError } = await supabase  
                    .from('wallets')
                    .update({
                        type, 
                        name: normalizedName
                    })
                    .eq('id', walletId)
                    .eq('user_id', userId)
                    .select()
                    .single()
                    if(updateError) throw updateError
                    return res.status(200).json({updateData})
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({error: `Internal server error occured`})
    }
    
}

export const deactivate = async(req,res) => {
    try {
        const id = req.params.id
        const userId = req.user.id

        const {data,error} = await supabase 
        .from('wallets')
        .update({
            is_active: false
        })
        .eq('id', id )
        .eq('user_id', userId)
        .select()
        if(!data || data.length===0){
            return res.status(404).json({ error: "Wallet not found" })
        }
        if(error) throw error
        return res.status(200).json({data})
    } catch (error) {
            console.error(error.message)
        return res.status(500).json({error: `Internal server error occured`})
    }
}