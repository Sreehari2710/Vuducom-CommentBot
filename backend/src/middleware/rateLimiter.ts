import rateLimit from 'express-rate-limit';

// Global limiter: 100 requests per minute per IP
export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter: 10 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login/signup attempts, please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Campaign limiter: 30 requests per 15 minutes per User (or IP if not logged in)
export const campaignLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  keyGenerator: (req: any) => {
    // If we have a userId from the JWT middleware, use it as the key
    return req.userId || req.ip;
  },
  message: { message: 'Campaign limit reached. Please wait 15 minutes before creating more campaigns.' },
  standardHeaders: true,
  legacyHeaders: false,
});
