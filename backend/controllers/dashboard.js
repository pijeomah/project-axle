import supabase from  '../config/supabase.js'
export const summary = async(req,res)=>{
    try {
        const userId = req.user.id
        // Date range for current calendar month 
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

const {data: wallets, error: walletError} = await supabase
                    .from('wallet_balances')
                    .select('id, name, type, balance')
                    .eq('user_id', userId)
                    .eq('is_active', true)
                    .neq('type', 'system')
                    .order('id', {ascending:true })

                    if(walletError){
                        console.error('Wallet error:', walletError)
                        throw walletError
                    } 
        
const { data: monthlyTransactions, error: monthlyError } = await supabase
            .from('transactions_with_type')
            .select('transaction_type, amount')
            .eq('user_id', userId)
            .eq('is_voided', false)
            .in('transaction_type', ['income', 'expense'])
            .gte('occurred_at', startOfMonth)
            .lte('occurred_at', endOfMonth)
        if (monthlyError){
            console.error('Wallet error:', monthlyError)
                        throw monthlyError
                }
const{ data: recentTransactions, error: recentError } = await supabase
            .from('transactions_with_amount')
            .select('id,description,occurred_at,amount')
            .eq('user_id', userId)
            .eq('is_voided', false)
            .order('occurred_at', {ascending: false})
            .limit(5)
            if(recentError){ 
                console.error('Recent error:', recentError)
                throw recentError
            }
            // Calculations

            const totalBalance = (wallets || []).reduce((sum, w)=> sum + Number(w.balance), 0)
            const monthlyIncome = (monthlyTransactions || [])
            .filter(t => t.transaction_type === 'income')    
            .reduce((sum,t) => sum + Number(t.amount), 0)

            const monthlyExpenses = (monthlyTransactions || [])
            .filter(t => t.transaction_type === 'expense')    
            .reduce((sum,t) => sum + Number(t.amount), 0)


            console.log('Dashboard response:', {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        wallets,
        recentTransactions
})
            return res.status(200).json({
                totalBalance,
                monthlyExpenses,
                monthlyIncome,
                netThisMonth: monthlyIncome - monthlyExpenses,
                wallets,
                recentTransactions
            })
    } catch (error) {
        console.error('Dashboard summary error:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
}
}