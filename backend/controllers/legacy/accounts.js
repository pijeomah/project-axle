import supabase from '../../config/supabase.js'


export const getAll = async(req,res)=> {
    try {
        const userId = req.user.id
        const { type } = req.query
        let query = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
        if(type){
            query = query.eq('account_type', type)
        }
        const {data, error} = await query
        .order('account_code', {ascending: true})
        if(error) throw error   
        return res.status(200).json({data})     

    } catch (error) {
        console.error('Fetch error', error.message)
        res.status(500).json({error: error.message})
           }

}

export const getOne =  async(req,res)=> {
   try {
         const accountId = req.params.id
    const userId = req.user.id
    const { data: accountData, error: accountError } = await supabase
            .from('accounts')
            .select('*')
            .eq('id', accountId)
            .eq('user_id', userId)
            .single()

        if(accountError?.code === 'PGRST116' || !accountData){
            return res.status(404).json({error:`Account not found`})
        }



        return res.status(200).json({accountData})

   } catch (error) {
    res.status(500).json({error: error.message}) 
   }
 
}

export const createAccount = async(req,res)=> {
    try {
        const userId = req.user.id
        const {
            account_name,
            account_type,
        } = req.body

        const account_code = await generateNextAccountCode(
            supabase,
            req.user.id,
            account_type

        )

        if(!account_name || !account_type ){
            return res.status(400).json({error: 'Account name, type or code are required'})
        }

        const validTypes = ['asset', 'liability', 'equity', 'income', 'expense']
        if( !validTypes.includes(account_type.toLowerCase())){
            return res.status(400).json({error:`Invalid account type. Must be one of: ${validTypes.join(', ')}` })
        }
        
        const normal_balance = ['asset', 'expense'].includes(account_type.toLowerCase()) ? 'debit' : 'credit';
         
        const {data: accountData, error: accountError} = await supabase
                .from('accounts')
                .insert({
                    user_id: userId,
                    created_at, 
                    account_code,
                    account_name,
                    account_type: account_type.toLowerCase(),
                    normal_balance,
    
                })
                .select()
                .single()
                if(accountError) {
                    if(accountError.code === '23505'){
                        return res.status(409).jsom({error:`An account with this code already exists `})
                    }
                    throw accountError
                }
                return res.status(201).json({
                    message: 'Account created ',
                    account: accountData})
        
    } catch (error) {
        console.error("Account Error:", error.message);
    res.status(500).json({ error: error.message });
    }

}