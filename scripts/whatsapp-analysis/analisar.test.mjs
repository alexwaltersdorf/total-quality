import { describe, it, expect } from 'vitest';
import { parseExport, analyzeConversation, buildVendorReport, buildFollowUpCsv } from './analisar.mjs';

const EXPORT_ANDROID = `12/07/2026 09:15 - Ana Souza: Oi, vi o anúncio de vocês. Quanto custa o check-up completo?
12/07/2026 09:22 - Total Quality: Bom dia! Aqui é o Carlos da Total Quality, tudo bem?
12/07/2026 09:23 - Total Quality: O check-up completo sai por R$ 450,00, com resultado em 24h.
12/07/2026 09:40 - Ana Souza: Hmm, vou pensar e depois te falo
12/07/2026 09:41 - Total Quality: Claro! Fico à disposição.`;

const EXPORT_CONVERTED = `10/07/2026 14:00 - Bruno Lima: Olá, queria agendar um exame
10/07/2026 14:03 - Total Quality: Olá! Sou a Maria, da Total Quality. Temos horário amanhã às 10h, pode ser?
10/07/2026 14:10 - Bruno Lima: Pode sim
10/07/2026 14:11 - Total Quality: Agendado! Te esperamos amanhã às 10h.`;

const EXPORT_UNANSWERED = `11/07/2026 16:00 - Carla Dias: Boa tarde, qual o valor da consulta?
11/07/2026 16:05 - Total Quality: Boa tarde! Aqui é o Carlos da Total Quality. A consulta custa R$ 200.
11/07/2026 18:30 - Carla Dias: Tem horário na sexta de manhã?`;

describe('parseExport', () => {
  it('interpreta o formato Android pt-BR com mensagens multilinha', () => {
    const msgs = parseExport(EXPORT_ANDROID);
    expect(msgs).toHaveLength(5);
    expect(msgs[0].sender).toBe('Ana Souza');
    expect(msgs[0].date.getFullYear()).toBe(2026);
    expect(msgs[1].sender).toBe('Total Quality');
  });

  it('interpreta o formato iOS com colchetes', () => {
    const msgs = parseExport('[10/07/2026 08:00:15] João: Bom dia');
    expect(msgs).toHaveLength(1);
    expect(msgs[0].sender).toBe('João');
    expect(msgs[0].date.getSeconds()).toBe(15);
  });

  it('descarta mídia oculta', () => {
    const msgs = parseExport('10/07/2026 08:00 - João: <Mídia oculta>');
    expect(msgs).toHaveLength(0);
  });
});

describe('analyzeConversation', () => {
  it('identifica o vendedor pela apresentação e mede a primeira resposta', () => {
    const conv = analyzeConversation(
      parseExport(EXPORT_ANDROID),
      'Conversa do WhatsApp com Ana Souza.txt',
    );
    expect(conv.vendor).toBe('Carlos');
    expect(conv.client).toBe('Ana Souza');
    expect(conv.firstResponseMin).toBe(7);
    expect(conv.converted).toBe(false);
    expect(conv.interested).toBe(true);
    expect(conv.hasObjection).toBe(true);
  });

  it('marca conversão quando há agendamento confirmado', () => {
    const conv = analyzeConversation(
      parseExport(EXPORT_CONVERTED),
      'Conversa do WhatsApp com Bruno Lima.txt',
    );
    expect(conv.vendor).toBe('Maria');
    expect(conv.converted).toBe(true);
  });

  it('detecta cliente sem resposta (última mensagem é do cliente)', () => {
    const conv = analyzeConversation(
      parseExport(EXPORT_UNANSWERED),
      'Conversa do WhatsApp com Carla Dias.txt',
    );
    expect(conv.lastFromClient).toBe(true);
    expect(conv.lastClientExcerpt).toContain('sexta de manhã');
  });
});

describe('relatórios', () => {
  const convs = [
    analyzeConversation(parseExport(EXPORT_ANDROID), 'Conversa do WhatsApp com Ana Souza.txt'),
    analyzeConversation(parseExport(EXPORT_CONVERTED), 'Conversa do WhatsApp com Bruno Lima.txt'),
    analyzeConversation(parseExport(EXPORT_UNANSWERED), 'Conversa do WhatsApp com Carla Dias.txt'),
  ];

  it('gera tabela por vendedor com taxa de conversão', () => {
    const md = buildVendorReport(convs);
    expect(md).toContain('| Carlos | 2 |');
    expect(md).toContain('| Maria | 1 |');
    expect(md).toContain('100%');
    expect(md).toContain('última mensagem do CLIENTE sem resposta');
  });

  it('lista follow-ups pendentes priorizando cliente sem resposta', () => {
    const { csv, count } = buildFollowUpCsv(convs, 1, new Date(2026, 6, 13, 12, 0));
    expect(count).toBe(2); // Ana (objeção) e Carla (sem resposta); Bruno converteu
    const lines = csv.split('\n');
    expect(lines[1]).toContain('Carla Dias');
    expect(lines[1]).toContain('CLIENTE SEM RESPOSTA');
    expect(lines[2]).toContain('Ana Souza');
    expect(csv).not.toContain('Bruno Lima');
  });
});
