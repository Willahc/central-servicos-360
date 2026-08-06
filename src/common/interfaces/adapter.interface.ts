export interface IExternalAdapterResponse<T> {
  success: boolean;
  data: T;
  mockMode: boolean;
  timestamp: string;
  provider: string;
}

export interface NonFlownTicket {
  id: string;
  ticketNumber: string;
  passengerCpf: string;
  passengerName: string;
  route: string;
  amount: number;
  expiresAt: string;
}

export interface ITravelAdapter {
  getNonFlownTickets(cpf: string): Promise<IExternalAdapterResponse<NonFlownTicket[]>>;
  issueVoucher(requestId: string): Promise<IExternalAdapterResponse<{ pnr: string; ticketCode: string }>>;
}

export interface IMobilityAdapter {
  requestVoucher(userEmail: string, costCenter: string, reason: string): Promise<IExternalAdapterResponse<{ voucherCode: string; qrCodeUrl: string }>>;
}

export interface IMailAdapter {
  generateShippingLabel(sender: string, recipient: string, modality: string): Promise<IExternalAdapterResponse<{ trackingCode: string; labelUrl: string }>>;
}

export interface IPrintAdapter {
  calculatePrintQuote(pages: number, color: boolean, finishing: string): Promise<IExternalAdapterResponse<{ estimatedCost: number }>>;
}
