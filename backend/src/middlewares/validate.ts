import { NextFunction, Request, Response } from 'express'
import { z, ZodTypeAny } from 'zod'

export const validateBody = <T extends ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        erro: 'Payload inválido',
        detalhes: z.flattenError(parsed.error),
      })
    }

    req.body = parsed.data
    next()
  }
}
