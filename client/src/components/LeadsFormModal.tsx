import { useState } from "react";
import { trackWhatsAppConversionWithLead } from "@/lib/tracking";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LeadsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: LeadFormData) => void;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function LeadsFormModal({
  isOpen,
  onClose,
  onSubmit,
}: LeadsFormModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(formData);
      }

      // Send to WhatsApp
      const message = `Olá! Meu nome é ${formData.name}. Email: ${formData.email}. Telefone: ${formData.phone}. Mensagem: ${formData.message}`;
      // Conversão identificada (o paciente preencheu nome, e-mail e telefone):
      // o hash do contato alimenta as conversões aprimoradas do Ads.
      void trackWhatsAppConversionWithLead("leads_modal", "modal", "cartao", {
        email: formData.email,
        telefone: formData.phone,
      });
      // Nova aba: o paciente continua com o site aberto atras da conversa.
      window.open(
        `https://wa.me/551238873535?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      onClose();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-text-light">
            Fale Conosco
          </h2>
          <button
            onClick={onClose}
            className="text-text-light hover:text-brand transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-light mb-2">
              Nome *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Seu nome completo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-light mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-light mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="(12) 98765-4321"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-light mb-2">
              Mensagem *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Descreva sua dúvida ou interesse..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand hover:bg-brand-dark text-white"
            >
              {isSubmitting ? "Enviando..." : "Enviar via WhatsApp"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
