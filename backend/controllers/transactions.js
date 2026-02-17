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
        
      }), 
      credit({
        walletId: source_wallet_id,
        tag_id: tag_id,
        amount,
       
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
        amount
      }),
      credit({
        walletId: source_wallet_id,
        tagId: tag_id,
        amount 
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
    const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('id, name, type')
        .eq('id', destination_wallet_id)
        .eq('user_id', userId)
        .single()

    if (walletError || !wallet) {
        throw new Error('Wallet does not exist or does not belong to the user')
    }
        const{data: tagData, error:tagError} = await supabase
      .from('wallets')
      .select('id,type')
      .eq('user_id', userId)
      .eq('id', tag_id)
      .eq('type', 'income')
      .single()

      if(tagError || !tagData){
        throw new Error(`Tag must exist and must be of type "transfer"`) 
      }
      const {data: systemWallet, error: systemError} = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'system')
          .single()
        if(!systemWallet || systemError){
          throw new Error(`System Wallet not found. Please contact support`)
        }

        return{
          transactionData:{
            user_id: userId,
            description: description,
            occurred_at
          },
          transactionLines:[
          {
            wallet_id: destination_wallet_id,
            amount: amount,
            tag_id: tag_id,
            direction: 'debit',
            
          },
          {
            wallet_id: systemWallet.id,
            amount: amount,
            tag_id: tag_id,
            direction: 'credit',
          
          }
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
    const { data: wallets, error: walletError } = await supabase
      .from('wallets')
      .select('name, id, type')
      .eq('id', wallet_id)
      .eq('user_id', userId)
      .single()

      if(walletError || !wallets ){
        throw new Error('Wallet does not exist or does not belong to user')
      }
      let openingBalanceTag
      const { data: existingTag } = await supabase
       .from('tags')
       .select('id')
       .eq('name', 'opening balance')
       .eq('user_id', userId)
       .eq('type', 'transfer')
       .maybeSingle()

       if(existingTag){
        openingBalanceTag = existingTag
       }else{
        const{data: newTag, error:tagError} = await supabase
            .from('tags')
            .insert({
              user_id: userId,
                      name: 'opening balance',
                      type: 'transfer',
                      is_active: true
            })
            .select('id')
            .single()

      if(tagError || !newTag){
        throw new Error(`Failed to create opening balance tag`) 
      }
      openingBalanceTag = newTag
       }

       
      const {data: systemWallet, error: systemError} = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'system')
          .single()
        if(!systemWallet || systemError){
          throw new Error(`System Wallet not found. Please contact support`)
        }
        return {
          transactionData: {
            user_id: userId,
            occurred_at,
            description: description ||  'Opening Balance'
          },
          transactionLines: [
            {
              wallet_id: wallet_id,
              tag_id: openingBalanceTag.id,
              amount: amount,
              direction: 'debit',
              

            },
            {
              wallet_id: systemWallet.id,
              tag_id: openingBalanceTag.id,
              amount: amount, 
              direction: 'credit',
                      
             }
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













