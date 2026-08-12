import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'

export type AccessTokenPayload = {
  sub: string
  role: string
}

type AuthenticatedRequest = Request & {
  auth?: AccessTokenPayload & JwtPayload
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn']

export const issueAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token ausente. Use Authorization: Bearer <token>.' })
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload & JwtPayload
    ;(req as AuthenticatedRequest).auth = decoded
    next()
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' })
  }
}

export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as AuthenticatedRequest).auth?.role

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ erro: 'Sem permissão para executar esta ação.' })
    }

    next()
  }
}
