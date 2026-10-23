import supabase from '../config/supabase.js'


export const getAll = async (req, res) => {
        try {
            const userId = req.user.id
            
            const {data, error} = await supabase
                    .from('payment-methods')
                    .select('*')
                    .eq('user_id', userId)
                     if(error){ res.status(500).json({error: error.message})}
                else res.status(200).json(data)
        } catch (error) {
            console.error("CRASH REPORT:", error.message)
           res.status(500).json({error: 'An unexpected error occurred'})

        }
    }


export const createPayment = async(req,res) =>{
    const {name, is_active} = req.body
    const userId = req.user.id
    if(!name){
        return res.status(400).json({error: 'Name and type are required'})

    }
        try {
            const {name} = req.body
            if (!name) {
            return res.status(400).json({ error: 'Name and type are required' })
        }
            
           
            const {data, error} = await supabase
                .from('payment-methods')
                .insert([
                    {
                        name,
                        user_id: userId, 
                        is_active: is_active !== undefined ? is_active : true,
                        is_system: false,


                    }
                ])
                .eq('user_id', userId)
                .select()
                .single()
                if (error) return res.status(500).json({ error: error.message })
        return res.status(201).json(data)
        } catch (error) {
            res.status(500).json({error: error.message})
        }
}


export const updatePayment = async(req,res)=> {
        try {
            const {id} = req.params
            const userId = req.user.id
            console.log('=== UPDATE PAYMENT DEBUG ===')
        console.log('Payment ID from params:', id)
        console.log('User ID:', userId)


               
                const {data : paymentMethod, error: fetchError} = await supabase 
                    .from('payment-methods')
                    .select('is_system')
                    .eq('id', id)
                    .eq('user_id', userId)
                    .single()

                    console.log('Found payment method:', paymentMethod)
        console.log('Fetch error:', fetchError)


                    if(!paymentMethod) return res.status(404).json({error: 'Payment not found'})
                    
                    if(paymentMethod.is_system) return res.status(403).json({error: 'Cannot edit system payment methods'})

            const { data,error } = await supabase 
            .from('payment-methods')
            .update(req.body)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single()
            if(error){
              return res.status(500).json({error: 'Internal server occurred'})
            }else{
                return res.status(200).json(data)
            }
        } catch (error) {
            res.status(500).json({error: error.message})
        }

}

export const deletePayment = async(req,res)=> {
    try {
        
        const {id} = req.params
        const userId = req.user.id
       
                const { data,error } = await supabase 
            .from('payment-methods')
            .update({is_active: false})
            .eq('id', id)
            .eq('user_id', userId)
            .select()
             if(error){
                res.status(500).json({error: 'Internal server error occurred'})
            }else{
                return res.status(200).json(data[0])
            }

    } catch (error) {
         res.status(500).json({error: error.message})
    }

}