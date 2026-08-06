import express, { Request, Response } from 'express';
import cors from 'cors';
import { envConfig } from './config/env.config';
import { MockTravelAdapter } from './adapters/mock-travel.adapter';
import { MockMobilityAdapter } from './adapters/mock-mobility.adapter';

const app = express();

app.use(cors());
app.use(express.json());

const travelAdapter = new MockTravelAdapter();
const mobilityAdapter = new MockMobilityAdapter();

// Status e Healthcheck
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    appName: envConfig.appName,
    version: '1.0.0-alpha.1 (Fase 1)',
    mode: envConfig.mockMode ? 'MOCK_ACTIVE' : 'PRODUCTION',
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Bilhetes Não Voados (Viagens)
app.get('/api/v1/travel/non-flown-tickets', async (req: Request, res: Response) => {
  const cpf = (req.query.cpf as string) || '123.456.789-00';
  const result = await travelAdapter.getNonFlownTickets(cpf);
  res.json(result);
});

// Endpoint: Solicitação de Voucher (Mobilidade)
app.post('/api/v1/mobility/voucher', async (req: Request, res: Response) => {
  const { userEmail, costCenter, reason } = req.body;
  const result = await mobilityAdapter.requestVoucher(userEmail || 'colaborador@ficticio.org', costCenter || 'CC-4000', reason || 'Deslocamento');
  res.json(result);
});

if (require.main === module) {
  app.listen(envConfig.port, () => {
    console.log(`=======================================================`);
    console.log(`  CENTRAL DE SERVIÇOS 360 - CORE (FASE 1)`);
    console.log(`  Servidor rodando em http://localhost:${envConfig.port}`);
    console.log(`  Modo Mock: ${envConfig.mockMode ? 'ATIVADO' : 'DESATIVADO'}`);
    console.log(`=======================================================`);
  });
}

export default app;
