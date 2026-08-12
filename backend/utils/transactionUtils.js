import supabase from "../config/supabase.js";

export async function getWalletOrThrow(userId, walletId){
    const isArray = Array.isArray(walletId)
    const query =  supabase 
        .from('wallets')
        .select('id, name, type')
        .eq('user_id', userId)
        if(isArray){
        const {data, error} = await query.in('id', walletId)
        if (error || !data || data.length !== walletId.length) {
            throw { status: 404, message: 'One or more wallets not found or unauthorized' };
        }
        return data;}
    else{
        const { data, error } = await query.eq('id', walletId).single();
        if (error || !data) {
            throw { status: 404, message: 'Wallet not found or unauthorized' };
        }
        return data;
    }

}

export async function getWalletsOrThrow(userId, walletIds){

    const {data, error} = await supabase
            .from('wallets')
            .select('id, type')
            .in('id', walletIds)
            .eq('user_id', userId)
            .single()

            if(error || !data || data.length !== walletIds.length){
                throw new Error('Wallets do not exist or do not belong to this user')
            }
            return data
}


export async function getSystemWalletOrThrow(userId){
    const { data, error} = await supabase
            .from('wallets')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'system')
            .single()

             if(error || !data){
                throw new Error('Wallets do not exist or do not belong to this user')
            }
            return data


}

export async function getTagOrThrow(userId, tagId, expectedType){
    const { data, error} = await supabase 
    .from('tags')
    .select('id, type')
    .eq('id', tagId)
    .eq('user_id', userId)
    .eq('type', expectedType)
    .single()
    

    if(error || !data){
        throw new Error(`Tag must exist and be of type ${expectedType}`)

    }

    return data
}

export function debit({walletId, tagId, amount}){
    return {
        wallet_id: walletId,
        tag_id: tagId,
        amount,
        direction: 'debit'
    }

}


export function  credit({walletId, tagId, amount}){
    return {
       
        
        wallet_id: walletId,
        tag_id: tagId,
        amount,
        direction: 'credit',
    }
}

export function baseTransaction({userId, occurred_at, description}){
    return {
        occurred_at,
        description,
        user_id: userId
}
}
