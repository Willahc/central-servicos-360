import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/AppError';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode
      }
    });
  }

  const parserError = err as Error & { type?: string; status?: number };
  if (parserError.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: { message: 'Corpo da requisição excede o limite permitido', statusCode: 413 } });
  }
  if (parserError instanceof SyntaxError && parserError.status === 400) {
    return res.status(400).json({ success: false, error: { message: 'JSON inválido', statusCode: 400 } });
  }
  if (parserError.message === 'Não permitido pelo CORS') {
    return res.status(403).json({ success: false, error: { message: 'Origem não permitida', statusCode: 403 } });
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Erro interno do servidor',
      statusCode: 500
    }
  });
}
