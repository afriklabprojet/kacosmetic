"use client"

import { Check } from "lucide-react"

interface Step {
  label: string
  href: string
}

const STEPS: Step[] = [
  { label: "Informations", href: "/checkout/informations" },
  { label: "Livraison", href: "/checkout/livraison" },
  { label: "Paiement", href: "/checkout/paiement" },
]

interface StepperProps {
  currentStep: number // 1-based
}

export default function Stepper({ currentStep }: Readonly<StepperProps>) {
  return (
    <nav aria-label="Étapes du checkout" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < currentStep
          const isActive = stepNumber === currentStep

          return (
            <li key={step.href} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    isDone
                      ? "border-[#C9A84C] bg-[#C9A84C] text-white"
                      : isActive
                        ? "border-[#C9A84C] bg-white text-[#C9A84C]"
                        : "border-[#E5D5C5] bg-white text-[#6B5744]"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isDone ? <Check size={14} /> : stepNumber}
                </div>
                <span
                  className={`mt-1.5 text-xs ${
                    isActive ? "font-semibold text-[#1A0A00]" : "text-[#6B5744]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-3 mb-5 h-px w-12 sm:w-20 ${
                    stepNumber < currentStep ? "bg-[#C9A84C]" : "bg-[#E5D5C5]"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
