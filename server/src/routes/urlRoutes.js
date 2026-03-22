import express from 'express'
import { createUrl, getUserUrls, deleteUrl } from '../controllers/urlController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createUrl)
router.get('/', protect, getUserUrls)
router.delete('/:id', protect, deleteUrl)

export default router