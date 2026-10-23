import express from 'express'
import { summary } from '../../controllers/dashboard.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()

router.get('/summary', requireAuth, summary)

export default router