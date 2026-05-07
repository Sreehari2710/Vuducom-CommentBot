import { type Response } from 'express';
import prisma from '../lib/prisma.js';
import { decrypt } from '../utils/crypto.js';
import { sanitizeString, isValidUrl } from '../utils/sanitizer.js';

export const createCampaign = async (req: any, res: Response) => {
  try {
    let { name, type, delay, interactions } = req.body;

    if (!name || !delay || !interactions) {
      return res.status(400).json({ message: 'Invalid campaign data' });
    }

    type = type || 'COMMENT';
    name = sanitizeString(name);
    const linkArr = interactions.links || [];
    const commentArr = interactions.comments || [];

    if (linkArr.length === 0) {
      return res.status(400).json({ message: 'At least one Instagram link is required' });
    }

    // Validate URLs and sanitize comments
    const sanitizedComments = commentArr.map((c: string) => sanitizeString(c));
    for (const link of linkArr) {
      if (!isValidUrl(link)) {
        return res.status(400).json({ message: `Invalid Instagram link: ${link}` });
      }
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        type,
        delay: parseInt(delay),
        userId: req.userId,
        interactions: {
          create: linkArr.map((link: string) => ({
            link: link.trim(),
            comment: sanitizedComments[Math.floor(Math.random() * sanitizedComments.length)],
            status: 'PENDING',
          })),
        },
      },
      include: {
        interactions: true,
      },
    });

    res.status(201).json(campaign);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'A campaign with this name already exists' });
    }
    console.error('CreateCampaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCampaigns = async (req: any, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { interactions: true },
        },
      },
    });

    res.status(200).json(campaigns);
  } catch (error) {
    console.error('GetCampaigns error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCampaignDetails = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id, userId: req.userId },
      include: {
        interactions: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error('GetCampaignDetails error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
