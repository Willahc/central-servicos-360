import { ITravelAdapter, IExternalAdapterResponse, NonFlownTicket } from '../common/interfaces/adapter.interface';

export class MockTravelAdapter implements ITravelAdapter {
  async getNonFlownTickets(cpf: string): Promise<IExternalAdapterResponse<NonFlownTicket[]>> {
    const mockTickets: NonFlownTicket[] = [
      {
        id: 'TKT-2026-089',
        ticketNumber: '957-2409182301',
        passengerCpf: cpf || '123.456.789-00',
        passengerName: 'Carlos Andrade',
        route: 'GRU -> BSB',
        amount: 850.00,
        expiresAt: '2026-09-30'
      },
      {
        id: 'TKT-2026-104',
        ticketNumber: '957-2409182302',
        passengerCpf: cpf || '123.456.789-00',
        passengerName: 'Carlos Andrade',
        route: 'CGH -> SDU',
        amount: 420.50,
        expiresAt: '2026-10-15'
      }
    ];

    return {
      success: true,
      data: mockTickets,
      mockMode: true,
      timestamp: new Date().toISOString(),
      provider: 'Argo / Copastur (Simulado)'
    };
  }

  async issueVoucher(requestId: string): Promise<IExternalAdapterResponse<{ pnr: string; ticketCode: string }>> {
    return {
      success: true,
      data: {
        pnr: `ARGO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        ticketCode: `TKT-${requestId}-${Math.floor(1000 + Math.random() * 9000)}`
      },
      mockMode: true,
      timestamp: new Date().toISOString(),
      provider: 'Argo (Simulado)'
    };
  }
}
