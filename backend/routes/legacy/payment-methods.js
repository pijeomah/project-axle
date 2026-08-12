import express from  'express'
import { sanitizeInput } from '../middleware/sanitizeInput.js'
import { validateUUID } from '../middleware/validateUUID.js'
import { getAll, createPayment,updatePayment, deletePayment }from '../controllers/payment-methods.js'
import { requireAuth } from '../middleware/auth.js'
const router = express.Router()


router.get('/', requireAuth, getAll )
router.post('/create', requireAuth, sanitizeInput, createPayment)
router.put('/:id', requireAuth, validateUUID(), sanitizeInput,  updatePayment)
router.delete('/:id', requireAuth, validateUUID(), deletePayment)



export default router