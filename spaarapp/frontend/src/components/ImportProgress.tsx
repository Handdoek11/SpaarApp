import React from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportProgressProps {
  progress: number
  total: number
  processed: number
  errors: number
  warnings: number
  currentTransaction?: string
  isComplete: boolean
  hasErrors: boolean
}

export const ImportProgress: React.FC<ImportProgressProps> = ({
  progress,
  total,
  processed,
  errors,
  warnings,
  currentTransaction,
  isComplete,
  hasErrors
}) => {
  const getStatusColor = () => {
    if (hasErrors) return 'bg-yellow-500'
    if (isComplete) return 'bg-green-500'
    return 'bg-blue-500'
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {isComplete ? 'Import voltooid' : 'Bezig met importeren...'}
          </h3>
          <div className="flex items-center gap-2">
            {!isComplete ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : hasErrors ? (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            <span className="text-2xl font-bold text-gray-900">{progress}%</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${getStatusColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-600">Totaal</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{processed - errors}</div>
          <div className="text-xs text-gray-600">Verwerkt</div>
        </div>
        {errors > 0 && (
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{errors}</div>
            <div className="text-xs text-gray-600">Fouten</div>
          </div>
        )}
        {warnings > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">{warnings}</div>
            <div className="text-xs text-gray-600">Waarschuwingen</div>
          </div>
        )}
      </div>

      {currentTransaction && !isComplete && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Huidige transactie:</span> {currentTransaction}
        </div>
      )}

      {isComplete && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {hasErrors
              ? `${processed} transacties verwerkt. ${errors} transacties konden niet worden geïmporteerd.`
              : `Alle ${processed} transacties succesvol geïmporteerd!`}
          </p>
          {warnings > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              {warnings} waarschuwingen gegenereerd. Controleer de details.
            </p>
          )}
        </div>
      )}
    </div>
  )
}