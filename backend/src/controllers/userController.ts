import { type Response } from 'express';
import prisma from '../lib/prisma.js';
import { encrypt } from '../utils/crypto.js';

export const updateCookies = async (req: any, res: Response) => {
  try {
    const { cookies } = req.body;

    if (!cookies) {
      return res.status(400).json({ message: 'Cookies are required' });
    }

    const encryptedCookies = encrypt(cookies);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { instaCookies: encryptedCookies },
    });

    res.status(200).json({
      message: 'Cookies updated successfully',
      instaCookies: user.instaCookies,
    });
  } catch (error) {
    console.error('UpdateCookies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
