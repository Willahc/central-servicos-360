import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware de validação Zod.
 * Retorna 422 para erros de validação (consistente com OpenAPI).
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      }) as { body?: unknown; query?: unknown; params?: unknown };
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as Request['query'];
      if (parsed.params !== undefined) req.params = parsed.params as Request['params'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map(i => {
          const path = i.path.join('.');
          return path ? `${path}: ${i.message}` : i.message;
        });
        return res.status(422).json({
          success: false,
          error: {
            message: 'Dados inválidos',
            statusCode: 422,
            details: messages
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Dados inválidos',
          statusCode: 400
        }
      });
    }
  };
}
