import { Router, Request, Response, NextFunction } from 'express';
import { mediaExtractorService } from '../services/MediaExtractorService';

export const analyzeRouter = Router();

analyzeRouter.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Paste a video link to continue.',
      });
    }

    const metadata = await mediaExtractorService.analyzeUrl(url);

    return res.status(200).json({
      success: true,
      ...metadata,
    });
  } catch (err) {
    next(err);
  }
});
