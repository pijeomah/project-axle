import express from  'express'
import { create, getOne, list, archive} from '../../controllers/transactions.js'
import { requireAuth } from '../../middleware/auth.js'
import { sanitizeInput } from '../../middleware/sanitizeInput.js'
import { validateUUID } from '../../middleware/validateUUID.js'
const router = express.Router()

router.get('/', requireAuth, list )
router.post('/create', requireAuth, sanitizeInput, create)
router.get('/:id', requireAuth, sanitizeInput, getOne)
router.delete('/:id', requireAuth, archive)
export default router
