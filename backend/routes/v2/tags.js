import express from  'express'
import { list, create, update, deactivate } from '../../controllers/tags.js'
import { requireAuth } from '../../middleware/auth.js'
import { sanitizeInput } from '../../middleware/sanitizeInput.js'
import { validateUUID } from '../../middleware/validateUUID.js'
const router = express.Router()

router.get('/', requireAuth, list )
router.put('/:id', requireAuth, validateUUID(), sanitizeInput, update)
router.post('/create', requireAuth, sanitizeInput, create)
router.delete('/:id', requireAuth, deactivate)
export default router
