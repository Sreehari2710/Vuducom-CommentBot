import { Router } from 'express';
import { createCampaign, getCampaigns, getCampaignDetails } from '../controllers/campaignController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { campaignLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/', campaignLimiter, createCampaign);
router.get('/', getCampaigns);
router.get('/:id', getCampaignDetails);

export default router;
