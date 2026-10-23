import express from  'express'
import { getAll, getOne, archive, createTransactions }from '../controllers/transactions.js'
import { requireAuth } from '../middleware/auth.js'
import { sanitizeInput } from '../middleware/sanitizeInput.js'
import { validateUUID } from '../middleware/validateUUID.js'
const router = express.Router()

router.get('/', requireAuth, getAll )
router.get('/:id', requireAuth, validateUUID(), getOne)
router.patch('/:id', requireAuth, validateUUID(), sanitizeInput, archive)
router.post('/create', requireAuth, sanitizeInput, createTransactions)

export default router
