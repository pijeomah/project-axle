import supabase from '../config/supabase.js'
import { getSystemWalletOrThrow, getTagOrThrow, getWalletOrThrow, getWalletsOrThrow,debit, credit, baseTransaction } from '../utils/transactionUtils.js'
export const create = async(req,res) => {
    try {
        const userId = req.user.id
        const { 
                occurred_at, 
                description, 
                action_type, 
                amount,
                source_wallet_id, 
                destination_wallet_id,
                wallet_id,
                tag_id
              } = req.body
              console.log('req.body', req.body);
              console.log('userId', userId);
         
        if(!occurred_at || !description || !action_type || !amount){
            return res.status(404).json({error: `Missing fields are required`})
        }
       
        if(amount <= 0){
            return res.status(400).json({error: `Amount must be greater than 0`})

        }

       
        let transactionPayload 
        
        switch(action_type){
          case 'TRANSFER':
            transactionPayload = await handleTransfer({
              userId,
              occurred_at,
              description,
              amount,
              source_wallet_id, 
              destination_wallet_id,
              tag_id
            })
            break

            case 'EXPENSE':
              transactionPayload = await handleExpense({
                userId,
                occurred_at,
                description,
                amount,
                source_wallet_id,
                tag_id
              })
              break
            case 'INCOME':
              transactionPayload = await handleIncome({
                userId,
                amount,
                occurred_at,
                description,
                destination_wallet_id,
                tag_id
              })
              break
              case 'OPENING_BALANCE':
                transactionPayload = await handleOpeningBalance({
                  userId,
                  amount, 
                  occurred_at,
                  description,
                  wallet_id
                })
                break

                default: 
                return res.status(400).json({error:`Invalid action type. Must be: INCOME, EXPENSES , TRANSFER or OPENING _BALANCE `})
        }
      
// Persisting transactions + lines
 let persistedTransaction
 
        try {
         
            persistedTransaction = await persistTransaction({
              
                userId,
                transactionPayload
            })
        } catch (persistError) {
            console.error(`Persistence failed:`, persistError)
            return res.status(500).json({ 
                error: `Failed to save transaction: ${persistError.message}` 
            })
        }

  // Success Response
  return res.status(201).json({
    message: `Transaction recorded successfully`,
    transaction: persistedTransaction
  })

    } catch (error) {
     console.error(`Create transaction error:`, error)   
     return res.status(500).json({error: `Internal Server Error`})
    }
}

async function handleTransfer({
  userId, occurred_at,description, amount, destination_wallet_id, source_wallet_id, tag_id
}){
  await getWalletOrThrow(userId, [source_wallet_id, destination_wallet_id])
  await getTagOrThrow(userId, tag_id, 'transfer')
  return{
    
    transactionData: baseTransaction({userId, occurred_at, description}),
    
    transactionLines:[
      debit({
        walletId: destination_wallet_id,
        amount, 
        tag_id: tag_id,
        direction: 'debit'
        
      }), 
      credit({
        walletId: source_wallet_id,
        tag_id: tag_id,
        amount,
        direction: 'credit'
       
      })
    ]
  }

}



async function handleExpense({
      userId, 
      tag_id,
      source_wallet_id,
      occurred_at,
      description,
      amount
}){
  await getWalletOrThrow(userId, source_wallet_id)
  await getTagOrThrow(userId, tag_id, 'expense')

  const systemWallet = await getSystemWalletOrThrow(userId)

  return {
    transactionData: baseTransaction({userId, occurred_at, description}),
    transactionLines: [
      debit({
        walletId: systemWallet.id,
        tagId: tag_id,
        amount,
        direction: 'debit'
      }),
      credit({
        walletId: source_wallet_id,
        tagId: tag_id,
        amount,
        direction: 'credit'
      })
    ]


  }

}

async function handleIncome({
      userId, 
      occurred_at,
      description, 
      amount, 
      destination_wallet_id, 
      tag_id}){
    await getWalletOrThrow(userId, destination_wallet_id)
    await getTagOrThrow(userId, tag_id, 'income')
    const systemWallet = await getSystemWalletOrThrow(userId)
        return{
    transactionData:baseTransaction({userId, occurred_at, description}),
          transactionLines:[
          debit({
            walletId: destination_wallet_id,
            amount: amount,
            tagId: tag_id,
            direction: 'debit',
            
          }),
          credit({
            walletId: systemWallet.id,
            amount: amount,
            tagId: tag_id,
            direction: 'credit',
          
          })
          ]

        }
}

async function handleOpeningBalance({
            userId,
            occurred_at,
            wallet_id,
            description,
            amount,
}){
    await getWalletOrThrow(userId, wallet_id)
      let openingBalanceTag
      const { data: existingTag } = await supabase
       .from('tags')
       .select('id')
       .eq('name', 'opening balance')
       .eq('user_id', userId)
       .eq('type', 'opening_balance')
       .maybeSingle()

       if(existingTag){
        openingBalanceTag = existingTag
       }else{
        const{data: newTag, error:tagError} = await supabase
            .from('tags')
            .insert({
              user_id: userId,
                      name: 'opening balance',
                      type: 'opening_balance',
                      is_active: true
            })
            .select('id')
            .single()

      if(tagError || !newTag){
        throw new Error(`Failed to create opening balance tag`) 
      }
      openingBalanceTag = newTag
       }

       
    const systemWallet = await getSystemWalletOrThrow(userId)

        return {
            transactionData:baseTransaction({userId, occurred_at, description}),
          transactionLines: [
            debit({
              walletId: wallet_id,
              tagId: openingBalanceTag.id,
              amount: amount,
              direction: 'debit',
              

            }),
            credit({
              walletId: systemWallet.id,
              tagId: openingBalanceTag.id,
              amount: amount, 
              direction: 'credit',
                      
             })
          ]
        }
    }

    async function persistTransaction({userId, transactionPayload}){
    const {transactionData, transactionLines} =  transactionPayload
    console.log('transactionPayload', transactionPayload);
    console.log('transactionData', transactionPayload.transactionData);
   
    const {data: transaction, error: transError} = await supabase 
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()

        if(transError) {throw new Error(`Failed to create transaction: ${transError.message}`)
        }

          const linesWithTransactionId = transactionLines.map(line => ({
            ...line,
            transaction_id: transaction.id
          }))

          const {data: lines, error: linesError} = await supabase
          .from('transaction_lines')
          .insert(linesWithTransactionId)
          .select()


          if(linesError){
            await supabase
            .from('transactions')
            .delete()
            .eq('id', transaction.id)
            throw new Error(`Failed to create transaction lines: ${linesError.message}`)
          }

            return {
        ...transaction,
        lines: lines
    }


    }



export const getOne = async(req,res) => {
  try {
    const userId = req.user.id
    const transactionId = req.params.id 
    const { data, error} = await supabase
    .from('transactions_with_amount')
    .select('occurred_at, description, amount')
    .eq('user_id', userId)
    .eq('id', transactionId)
    .single()
    if(error) throw Error
    return res.status(200).json({data})
  } catch (error) {
    console.error(error.message)
        return res.status(500).json({error: 'Internal Server Error'})
  }

}

export const list = async(req,res) => {
    try {
        const page = parseInt(req.query.page)|| 1
        const limit = parseInt(req.query.limit) || 10

        const from = (page -1) * limit
        const to = from + limit -1
        const userId = req.user.id
        const {data, count, error} = await supabase 
                .from('transactions_with_amount')
                .select('*', {count: 'exact'})
                .eq('user_id', userId)
                .order('occurred_at', {ascending: false})
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



export const archive = async(req,res)=> {
  try {
    const userId = req.user.id
    const transId = req.params.id
    const {data: transaction, error: fetchError} = await supabase 
          .from('transactions')
          .select('id, is_voided')
          .eq('id', transId)
          .eq('user_id', userId)
          .single()
          if(fetchError || !transaction){
    return res.status(404).json({error: `Transaction not found`}) }

    if(transaction.is_voided){
       return res.status(400).json({ error: 'Transaction already archived' })
    }

     const { data, error: updateError } = await supabase
      .from('transactions')
      .update({ is_voided: true })
      .eq('id', transId)
      .eq('user_id', userId)
      .select()
      .single()
    if (updateError) throw updateError
    return res.status(200).json(data)
  } catch (error) {
    console.error(error.message)
        return res.status(500).json({error: 'Internal Server Error'})
  }
}





