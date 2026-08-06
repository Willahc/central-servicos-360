import { IMobilityAdapter, IExternalAdapterResponse } from '../common/interfaces/adapter.interface';

export class MockMobilityAdapter implements IMobilityAdapter {
  async requestVoucher(userEmail: string, costCenter: string, reason: string): Promise<IExternalAdapterResponse<{ voucherCode: string; qrCodeUrl: string }>> {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      success: true,
      data: {
        voucherCode: `UBER-HSL-${randomCode}`,
        qrCodeUrl: `https://mock.siriolibanes.org.br/vouchers/uber/${randomCode}.png`
      },
      mockMode: true,
      timestamp: new Date().toISOString(),
      provider: 'Uber for Business (Simulado)'
    };
  }
}
