import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import {
  trackCtaClick,
  trackWhatsAppClick,
  trackWhatsAppModalOpen,
  trackWhatsAppRedirectRequested,
} from "../client/src/lib/tracking";

describe("funil de WhatsApp", () => {
  let events: Record<string, unknown>[];

  beforeEach(() => {
    events = [];
    vi.stubGlobal("window", {
      dataLayer: events,
      location: { href: "https://totalquality.med.br/exames/exames-de-sangue", pathname: "/exames/exames-de-sangue", hostname: "totalquality.med.br" },
    });
    vi.stubGlobal("document", { title: "Exames de Sangue", referrer: "" });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("abrir o menu flutuante e iniciar contato gera somente uma conversão de clique", () => {
    trackCtaClick("fab_open");
    trackWhatsAppClick("fab_iniciar_conversa");
    trackWhatsAppModalOpen("whatsapp_fab");
    expect(events.map(e => e.event)).toEqual(["select_content", "whatsapp_click", "whatsapp_modal_open"]);
    expect(events.filter(e => e.event === "whatsapp_click")).toHaveLength(1);
    const fab = readFileSync(new URL("../client/src/components/WhatsAppFAB.tsx", import.meta.url), "utf8");
    expect(fab).toContain('trackCtaClick("fab_open")');
    expect(fab).not.toContain('trackWhatsAppClick("fab_open")');
  });

  it("relaciona abertura e saída no mesmo fluxo sem valor de venda ou dados do formulário", () => {
    const id = trackWhatsAppModalOpen("exame_exames-de-sangue");
    trackWhatsAppRedirectRequested("exame_exames-de-sangue", id);
    expect(events.map(e => e.event)).toEqual(["whatsapp_modal_open", "whatsapp_redirect_requested"]);
    expect(events[0].flow_id).toBe(id);
    expect(events[1].flow_id).toBe(id);
    expect(events[0].event_id).not.toBe(events[1].event_id);
    for (const event of events) {
      expect(event.event_category).toBe("engagement");
      for (const key of ["name", "email", "telefone", "message", "user_data", "exam_type", "value", "currency"]) {
        expect(event).not.toHaveProperty(key);
      }
    }
  });

  it("abertura sem continuação não fabrica saída e nova tentativa recebe outro ID", () => {
    const first = trackWhatsAppModalOpen("footer_cta");
    const second = trackWhatsAppModalOpen("footer_cta");
    expect(first).not.toBe(second);
    expect(events.filter(e => e.event === "whatsapp_redirect_requested")).toHaveLength(0);
  });
});
