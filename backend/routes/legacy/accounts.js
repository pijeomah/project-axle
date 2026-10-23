import express from  'express'
import { getAll, getOne, createAccount } from '../controllers/accounts.js'
import { requireAuth } from '../middleware/auth.js'
import { sanitizeInput } from '../middleware/sanitizeInput.js'
import { validateUUID } from '../middleware/validateUUID.js'
const router = express.Router()

router.get('/', requireAuth, getAll )
router.get('/:id', requireAuth, validateUUID(), getOne)
router.post('/create', requireAuth, sanitizeInput, createAccount)

export default router
