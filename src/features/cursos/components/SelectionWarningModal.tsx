import React from 'react'
import { AlertCircle, X } from 'lucide-react'

interface SelectionWarningModalProps {
  isOpen: boolean
  onClose: () => void
  warningMessage: string
}

export const SelectionWarningModal: React.FC<SelectionWarningModalProps> = ({
  isOpen,
  onClose,
  warningMessage
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-in zoom-in-95 fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-yellow-500 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Atención</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Warning Message */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <p className="text-orange-900 text-center font-medium">
                {warningMessage}
              </p>
            </div>

            {/* Explanation */}
            <p className="text-gray-600 text-sm text-center">
              Por favor, revisa tu selección antes de continuar.
            </p>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0">
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-femme-magenta to-femme-rose text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
