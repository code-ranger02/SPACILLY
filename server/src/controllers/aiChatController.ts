import { Response } from 'express';
import { AuthenticatedRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { geminiPublicErrorPayload } from "../config/geminiEnv.js";
import { handleChat, ChatRole } from "../services/gemini.service.js";

function roleFromUser(role?: string): ChatRole {
  if (role === 'admin') return 'admin';
  if (role === 'seller') return 'seller';
  if (role === 'buyer') return 'buyer';
  return 'guest';
}

/**
 * POST /api/ai/chat
 * Optional JWT: guests can use product search; order tools require auth.
 */
export async function postAiChat(req: AuthenticatedRequest, res: Response) {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    let userId: string | null = req.user?.id ?? null;
    let role: ChatRole = req.user ? roleFromUser(req.user.role) : 'guest';
    let email = req.user?.email;
    let phone = req.user?.phone;
    let fullName = req.user?.fullName;

    if (userId && (!fullName || !phone)) {
      const u = await User.findById(userId).select('fullName phone email').lean();
      if (u) {
        fullName = fullName || u.fullName;
        phone = phone || u.phone;
        email = email || u.email;
      }
    }

    const result = await handleChat(message, {
      userId,
      role,
      email,
      phone,
      fullName,
    });

    return res.json({
      reply: result.reply,
      role,
      products: result.products,
      payment: result.payment,
      model: result.modelUsed,
      fallbackOccurred: result.fallbackOccurred,
    });
  } catch (error: any) {
    const mapped = geminiPublicErrorPayload(error);
    if (mapped) {
      return res.status(mapped.status).json({ message: mapped.message });
    }
    const msg = error?.message || 'AI chat failed';
    // eslint-disable-next-line no-console
    console.error('postAiChat error:', error);
    return res.status(500).json({ message: msg });
  }
}
