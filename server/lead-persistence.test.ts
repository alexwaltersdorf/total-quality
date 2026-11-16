import { afterEach, describe, expect, it, vi } from 'vitest';
import { persistLead } from './_core/persistLead';
vi.mock('./_core/env', () => ({ ENV: { googleSheetsWebhookUrl: 'https://script.google.com/macros/s/test/exec' } }));
import { syncLeadToSheet } from './_core/googleSheetsSync';
const lead = { source: 'teste_tecnico', page: '/' };
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('persistencia independente', () => {
  it('registra na planilha mesmo com banco indisponivel', async () => {
    const sheet = vi.fn().mockResolvedValue(true);
    await expect(persistLead(async () => { throw new Error('Database not available'); }, sheet)).resolves.toEqual({ success: true });
    expect(sheet).toHaveBeenCalledOnce();
  });
  it('preserva sucesso no banco se planilha falhar', async () => {
    await expect(persistLead(async () => ({ success: true }), async () => false)).resolves.toEqual({ success: true });
  });
  it('nao confirma captura quando os dois destinos falham', async () => {
    await expect(persistLead(async () => { throw new Error('db'); }, async () => false)).rejects.toThrow('Nao foi possivel registrar');
  });
});
describe('resposta do webhook', () => {
  it('aceita redirect do Apps Script sem reenviar o POST', async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://script.googleusercontent.com/macros/echo?test=1' } }));
    vi.stubGlobal('fetch', request);
    expect(await syncLeadToSheet(lead)).toBe(true);
    expect(request).toHaveBeenCalledOnce();
    expect(request.mock.calls[0][1].redirect).toBe('manual');
  });
  it('rejeita redirect para login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://accounts.google.com/' } })));
    expect(await syncLeadToSheet(lead)).toBe(false);
  });
  it.each([{ success: true }, { ok: true }])('aceita confirmacao JSON %j', async body => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body)));
    expect(await syncLeadToSheet(lead)).toBe(true);
  });
  it.each([{ success: false }, { success: true, error: 'falha' }])('rejeita erro mesmo com HTTP 200 %j', async body => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(body)));
    expect(await syncLeadToSheet(lead)).toBe(false);
  });
  it('nao repete um envio com timeout', async () => {
    const request = vi.fn().mockRejectedValue(new Error('timeout'));
    vi.stubGlobal('fetch', request);
    expect(await syncLeadToSheet(lead)).toBe(false);
    expect(request).toHaveBeenCalledOnce();
  });
});
