import React from 'react'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

// ================= Stepper (visual) =================
interface StepperProps {
  step: number
  setStep: (i: number) => void
  steps: string[]
}

export function Stepper({ step, setStep, steps }: StepperProps) {
  return (
    <div className="flex items-center gap-4 mb-6 overflow-auto">
      {steps.map((label, idx) => {
        const active = idx === step
        const completed = idx < step
        return (
          <React.Fragment key={label}>
            <button
              type="button"
              onClick={() => setStep(idx)}
              className={`flex items-center gap-3 rounded-full pr-4 transition ${active ? 'bg-pink-100' : 'bg-muted'}`}
            >
              <span className={`grid place-items-center w-8 h-8 rounded-full border ${completed ? 'bg-femme-rose text-white border-femme-magenta' : 'bg-white'}`}>
                {completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-4 h-4" />}
              </span>
              <span className={`text-sm font-medium ${active ? 'text-pink-700' : 'text-foreground'}`}>{label}</span>
            </button>
            {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </React.Fragment>
        )
      })}
    </div>
  )
}