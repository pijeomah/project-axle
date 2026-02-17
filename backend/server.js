import express from 'express' 
import dotenv from 'dotenv'
import cors from 'cors'
import authV2Routes from './routes/v2/auth.js'
import transactionsV2Routes from './routes/v2/transactions.js'
import walletsV2Routes from './routes/v2/wallets.js'
import tagsV2Routes from './routes/v2/tags.js'
import  supabase  from './config/supabase.js'


dotenv.config()

 const app = express()
 const PORT = process.env.PORT || 5000


app.use(cors())
app.use(express.json())



app.get('/', (req, res) =>{
    res.json({message: 'Hello World'})

})


app.use('/api/v2/auth', authV2Routes)
app.use('/api/v2/wallets', walletsV2Routes)
app.use('/api/v2/transactions', transactionsV2Routes)
app.use('/api/v2/tags', tagsV2Routes)


// Server Error handling
app.use((err, req,res,next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})


app.use((req,res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

app.listen(PORT, ()=>{
    console.log(`Sever running on ${PORT}. Try catching it`)

})