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

  console.error('Erro não tratado:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Erro interno do servidor',
      statusCode: 500
    }
  });
}