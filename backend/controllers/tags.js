
import supabase from './../config/supabase.js'

export const create = async (req,res)=> {
    try {
        const userId = req.user.id
        const { name, type } = req.body
        console.log('USER IN CONTROLLER:', req.user)
        const normalizedName = name.toLowerCase().trim()
        if(!normalizedName|| !type){
            return res.status(400).json({error:`Name and type are required` })
        }
        
        if(type !== 'income' &&  type !== 'expense' && type !== 'transfer'){
            return res.status(400).json({error: `Incorrect type! Please enter the appropriate type`})
        }

const {data: existingTag, error} = await supabase
        .from('tags')
        .select('id,is_active')
        .eq('user_id', userId)
        .eq('name', normalizedName)
        .eq('type', type)
        .maybeSingle()

        if(error){
            throw error 
        }

        if(existingTag){
            if(existingTag.is_active){
                return res.status(409).json({
                    error: `Tag already exists`
                })
            }
        }


// revive tag here 
        const {data: newTag, error: createError} = await supabase
        .from('tags')
        .insert({
            'user_id': userId,
            name: normalizedName, 
            type,
            is_active: true
        })
        .select()
        .single()
       if(createError){
        throw createError
       }
        return res.status(201).json({newTag})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const list = async(req,res) => {
    try {
        const userId = req.user.id
        const { data, error} = await supabase 
        .from('tags')
        .select('*')
        .eq('user_id',userId)
        .order('id', {ascending: true})
        if(error) throw error
    
        return res.status(200).json({data})
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({error: 'Internal Server Error'})
    }
}


export const update = async(req,res)=>{
   try {
     const userId = req.user.id
    const tagId  = req.params.id
    const {name, type} = req.body
    const normalizedName = name.toLowerCase().trim()
    if(!normalizedName|| !type){
            return res.status(400).json({error:`Name and type are required` })
        }
        
const { data: existingTag, error } = await supabase
        .from('tags')
        .select('id', type)
        .eq('user_id', req.user.id)
        .eq('name', normalizedName)
        .eq('type', type)
        .eq('is_active', true)
        .neq('id', tagId)
        .maybeSingle();

      if(error){
            throw error 
        }

        if(existingTag){
            if(existingTag.is_active){
                return res.status(409).json({
                    error: `Tag already exists`
                })
            }
        }

    const {data: updateData, error: updateError} = await supabase 
    .from('tags')
    .update({
        type, 
        'name': normalizedName
    })
    .eq('id', tagId)
    .eq('user_id',userId)
    .select()
    .single()
    if(updateError) throw error

    return res.status(200).json({updateData})
    
   } catch (error) {
    console.error(error.message)
        return res.status(500).json({error: 'Internal Server Error'})
   }

}

export const deactivate = async(req,res) => {
    try {
        const id = req.params.id
        const userId = req.user.id

        const {data,error} = await supabase 
        .from('tags')
        .update({
            is_active: false
        })
        .eq('id', id )
        .eq('user_id', userId)
        .select()
        if(!data || data.length===0){
            return "Tag not found"
        }
        if(error) throw error
        return res.status(200).json({data})
    } catch (error) {
           res.status(500).json({error: error.message})
    }
}