import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plan } from "@/lib/cartaoPlanos";

interface PricingCardProps {
  plan: Plan;
  onSelect: (planId: string) => void;
}

export default function CartaoPricingCard({ plan, onSelect }: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-lg border-2 transition-all duration-300 ${
        plan.highlighted
          ? "border-brand bg-gradient-to-b from-brand/5 to-white shadow-xl scale-105"
          : "border-gray-200 bg-white hover:shadow-lg"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-brand text-white px-4 py-1 rounded-full text-sm font-bold">
          MAIS POPULAR
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.subtitle}</p>
        </div>

        {/* Preço */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-brand">{plan.price}</span>
            <span className="text-gray-600">{plan.period}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onSelect(plan.id)}
          className="w-full mb-8 py-3 px-6 text-lg font-bold rounded-lg transition-all bg-brand hover:bg-brand-dark text-white"
        >
          {plan.cta}
        </button>

        {/* Benefícios */}
        <div className="space-y-4">
          <div className="border-t pt-6">
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">
              Benefícios Exclusivos
            </h4>
            <ul className="space-y-3">
              {plan.exclusiveBenefits?.map((benefit, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase">
              Benefícios para Família
            </h4>
            <ul className="space-y-3">
              {plan.familyBenefits?.map((benefit, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
