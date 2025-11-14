import React, { useState, useCallback } from 'react'
import { FileText, Upload, AlertCircle, CheckCircle, Loader2, Eye, X } from 'lucide-react'
import { appApi, csvApi, filesApi } from '../services/apiWithFallback'
import { CsvImportResult, Transaction } from '../types'

interface CsvImportProps {
  onImportComplete?: (transactions: Transaction[]) => void
  onCancel?: () => void
}

export const CsvImport: React.FC<CsvImportProps> = ({ onImportComplete, onCancel }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CsvImportResult | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'processing'>('upload')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = async (file: File) => {
    setFile(file)
    setError(null)
    setIsLoading(true)

    try {
      const content = await file.text()

      // Validate CSV structure
      const isValid = await csvApi.validateStructure(content)
      if (!isValid) {
        setError('Het CSV-bestand heeft geen geldig Rabobank formaat. Controleer of de volgende kolommen aanwezig zijn: Datum, Naam/Omschrijving, Rekening, Tegenrekening, Code, Af/Bij, Bedrag, MutatieSoort, Mededelingen')
        setIsLoading(false)
        return
      }

      // Get preview
      const result = await csvApi.previewContent(content, 10)
      setPreview(result)

      if (result.errors.length > 0) {
        setError(`Er zijn ${result.errors.length} fouten gevonden in het bestand`)
      }

      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een onverwachte fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      processFile(droppedFile)
    } else {
      setError('Selecteer een geldig CSV-bestand')
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await processFile(selectedFile)
    }
  }

  const handleSelectFile = async () => {
    try {
      const filePath = await filesApi.selectCsvFile()
      if (filePath) {
        // Read the file content
        const content = await filesApi.readFile(filePath)

        // Create a File object from the content
        const fileName = filePath.split(/[\\/]/).pop() || 'transactions.csv'
        const blob = new Blob([content], { type: 'text/csv' })
        const file = new File([blob], fileName, { type: 'text/csv' })

        await processFile(file)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bestand selecteren mislukt')
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsLoading(true)
    setStep('processing')
    setProgress(0)

    try {
      const content = await file.text()
      const result = await csvApi.parseContent(content)

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      setTimeout(() => {
        clearInterval(interval)
        setProgress(100)
        setIsLoading(false)

        if (result.errors.length === 0) {
          onImportComplete?.(result.transactions)
        } else {
          setError(`${result.errors.length} transacties konden niet worden geïmporteerd`)
        }
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import mislukt')
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rabobank CSV Import
        </h2>
        <p className="text-gray-600">
          Importeer je transacties vanuit een Rabobank CSV-export
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            {preview && preview.errors.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-red-700 cursor-pointer">
                  Bekijk details
                </summary>
                <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
                  {preview.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {preview.errors.length > 5 && (
                    <li>...en nog {preview.errors.length - 5} fouten</li>
                  )}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}

      {step === 'upload' && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Sleep je CSV-bestand hier naartoe
            </p>
            <p className="text-sm text-gray-500 mb-4">
              of selecteer een bestand van je computer
            </p>
            <div className="flex gap-3">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                ) : (
                  <Upload className="w-4 h-4 inline mr-2" />
                )}
                Kies bestand
              </label>
              <button
                onClick={handleSelectFile}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                Bladeren
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-medium text-green-900">
                CSV-bestand succesvol gelezen
              </h3>
            </div>
            <p className="text-sm text-green-700">
              {preview.imported_rows} van de {preview.total_rows} regels kunnen worden geïmporteerd
            </p>
            {preview.warnings.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ {preview.warnings.length} waarschuwingen
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Voorbeeld transacties</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Omschrijving
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rekening
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bedrag
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {transaction.account_number || '-'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium">
                        <span className={transaction.transaction_type === 'debit' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.transaction_type === 'debit' ? '-' : '+'}
                          {formatAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.transaction_type === 'debit'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.transaction_type === 'debit' ? 'Af' : 'Bij'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.transactions.length > 5 && (
              <div className="px-4 py-2 bg-gray-50 text-center text-sm text-gray-600">
                ...en nog {preview.transactions.length - 5} transacties
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setStep('upload')
                setPreview(null)
                setFile(null)
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Nog een bestand
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              <CheckCircle className="w-4 h-4" />
              Importeer {preview.imported_rows} transacties
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="mb-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bezig met importeren...
          </h3>
          <div className="w-full max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{progress}% voltooid</p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Even geduld, je transacties worden verwerkt
          </p>
        </div>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Annuleren
        </button>
      )}
    </div>
  )
}
