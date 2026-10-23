import supabase from '../config/supabase.js'

export const getAll = async(req,res) => {
    try {
        const page = parseInt(req.query.page)|| 1
        const limit = parseInt(req.query.limit) || 10

        const from = (page -1) * limit
        const to = from + limit -1
        const userId = req.user.id
        const {data, count, error} = await supabase 
                .from('transactions')
                .select('*', {count: 'exact'})
                .eq('user_id', userId)
                .order('transaction_date', {ascending: false})
                .range(from, to)
                if(error) throw error

                res.status(200).json({
                    data,
                    pagination: {
                        total_records:count,
                        current_page: page,
                        total_pages: Math.ceil(count/limit),
                        per_page: limit
                    }
                })

    } catch (error) {
        res.status(500).json({error: error.message})
    }

}

export const getOne = async(req, res)=> {

    try {
        const transactionId = req.params.id
        const userId = req.user.id
        const {data, error} = await supabase
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .eq('user_id', userId)
            .single()
            if( error){
                if(error.code === `PGRST116`){
                    return res.status(404).json({ error: 'Transaction not found' })
                }
                throw error
            } 
            if(!error) return res.status(200).json(data)
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }

}

export const archive = async(req, res) => {
        try {
            
    const transactionId = req.params.id
    const userId = req.user.id
    const { data, error } = await supabase
        .from('transactions')
        .update({deleted_at: new Date().toISOString()})
        .eq('id', transactionId)
        .eq('user_id', userId)
        .select()

        if(error) throw error

        if(data.length === 0){
            return res.status(404).json({error: `Transaction not found`})
        }else{
            return res.status(200).json({message: `Transaction archived successfully`})
        }
        } catch (error) {
            console.error(error)
            res.status(500).json({error: `Internal Server Error`})
        }

}

export const createTransactions = async(req,res)=> {
    const userId = req.user.id
    const 
    {transaction_date, 
    type,
    amount, 
    status,  
    notes,
    account_id,
    category_id, 
    payment_method_id
} = req.body
        console.log("=== DEBUGGING INPUTS ===");
        console.log("Type:", type);
        console.log("Account ID:", account_id);
        console.log("Category ID:", category_id);
        console.log("Payment Method ID:", payment_method_id);

if(!amount|| !transaction_date || !type|| !category_id || !payment_method_id || !account_id || !status || !notes ){
return res.status(400).json({error: `Missing critical fields`})
}

let debitLine = {}
let creditLine = {}
const normalizedType = type.toLowerCase()
if(normalizedType === 'expense'){
    // EXPENSE: Money moves FROM Bank TO Category
    debitLine = {
        account_id: account_id,
       category_id: category_id,
        payment_method_id: null, // Must be null
        debit_amount: amount,
        credit_amount: 0

    }, 
    creditLine = {
        // Source: The Payment Method (e.g., Bank)
        account_id: account_id,
        payment_method_id: payment_method_id,
        category_id: null,
        credit_amount: amount, 
        debit_amount: 0
    }
}else if(normalizedType === 'income'){
    // INCOME: Money moves FROM Category TO Bank
    debitLine ={
        account_id: account_id,
        category_id: null,
        payment_method_id: payment_method_id,
        debit_amount: amount,
        credit_amount: 0
    }
    creditLine = {
        // Source: The Category (e.g., Salary)
        account_id: account_id,
        category_id: category_id,
        payment_method_id:null, 
        credit_amount: amount,
        debit_amount: 0
    }

}else{
    return res.status(400).json({error: `Invalid transaction type:${type} `})
}

try {
    const { data: transData,error } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            transaction_date, 
            type,
            amount, 
            category_id, 
            payment_method_id, 
            account_id, 
            status,  
            notes
        })
        .select()
        .single()
        if(error) throw error
        const newTransId = transData.id
        const linesToInsert = [
            {
                ...debitLine,
                transaction_id: newTransId,
                user_id: userId,
              
                
            }, 
            {
                ...creditLine,
                transaction_id: newTransId,
                user_id: userId,
               
               
            }
        ]

        console.log("\n========== FINAL PAYLOAD DEBUG ==========");
        console.log(JSON.stringify(linesToInsert, null, 2));
        console.log("=========================================\n");

        const {data: linesData, error:linesError} = await supabase
                    .from('transaction-lines')
                    .insert(linesToInsert)
                    .select()

                    if(linesError){
                        console.error(`Line insertion failed. Rolling back header...`)
                        await supabase.from('transactions').delete().eq('id', newTransId)
                        throw linesError
                    }

                    res.status(201).json({
                            message: `Transaction created successfully`,
                            transaction: transData,
                            lines: linesData
                        })
} catch (error) {
    console.error("Transaction Error:", error.message);
    res.status(500).json({ error: error.message });
}
}