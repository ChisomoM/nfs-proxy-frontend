import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Send, Loader2, ArrowLeft } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { useDisbursements } from '@/hooks/useDisbursements'
import { useNameVerification } from '@/hooks/useNameVerification'
import { UploadZone } from './UploadZone'
import { ConfirmDisbursementModal } from './ConfirmDisbursementModal'
import { VerificationProgress } from './VerificationProgress'
import { VerificationSummaryBar } from './VerificationSummaryBar'
import { VerificationTable } from './VerificationTable'

type Step = 'upload' | 'verifying' | 'review'

const PAGE_SIZE = 25

const stepVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

const stepTransition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

export const DisbursementsPage: React.FC = () => {
  const [step, setStep] = useState<Step>('upload')
  const [isRetrying, setIsRetrying] = useState(false)
  const [verifyPage, setVerifyPage] = useState(1)

  const disbursement = useDisbursements()
  const verification = useNameVerification()

  const {
    schema,
    schemaLoading,
    isDragging,
    setIsDragging,
    handleDownloadTemplate,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    showConfirmModal,
    isSubmitting,
    totalRecipients,
    totalAmount,
    rows: disbursementRows,
  } = disbursement

  // Override file parsed to kick off verification flow
  const handleFileParsed = async (file: File) => {
    await disbursement.handleFileParsed(file)
    // Wait a tick so rows state propagates from the hook's setState
    // We read rows directly from disbursement.rows after the await
    setStep('verifying')
    setVerifyPage(1)
  }

  // After step changes to 'verifying', disbursementRows will have the parsed data
  // We use a separate effect-like pattern: watch when step becomes 'verifying'
  // and rows are populated, then call startVerification
  const [hasStartedVerification, setHasStartedVerification] = useState(false)

  React.useEffect(() => {
    if (step === 'verifying' && disbursementRows.length > 0 && !hasStartedVerification) {
      setHasStartedVerification(true)
      verification.startVerification(disbursementRows, schema).then(() => {
        setStep('review')
        setHasStartedVerification(false)
      })
    }
  }, [step, disbursementRows, hasStartedVerification, verification, schema])

  const handleRetryFailed = async () => {
    setIsRetrying(true)
    try {
      await verification.retryFailed()
    } finally {
      setIsRetrying(false)
    }
  }

  const handleBackToUpload = () => {
    disbursement.resetRows()
    verification.reset()
    setStep('upload')
    setVerifyPage(1)
  }

  const totalVerifyPages = Math.max(1, Math.ceil(verification.filteredRows.length / PAGE_SIZE))

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-display-sm text-gradient-brand">
              Bulk Disbursements
            </h1>
            <p className="font-sans text-text-md text-gray-500 mt-1">
              {step === 'upload'
                ? 'Upload a CSV to disburse funds to multiple recipients at once.'
                : step === 'verifying'
                ? 'Verifying account names against the network…'
                : 'Review account name matches before submitting.'}
            </p>
          </div>

          <motion.button
            whileHover={schemaLoading ? {} : { scale: 1.02 }}
            whileTap={schemaLoading ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={handleDownloadTemplate}
            disabled={schemaLoading}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-sans font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50 flex-shrink-0"
          >
            <Download size={15} />
            Download Template
          </motion.button>
        </div>

        {/* Step views */}
        <AnimatePresence mode="wait">

          {/* ── Upload ──────────────────────────────────────────────────── */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
              className="bg-white"
            >
              <UploadZone
                onFileParsed={handleFileParsed}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
              />
            </motion.div>
          )}

          {/* ── Verifying ───────────────────────────────────────────────── */}
          {step === 'verifying' && (
            <motion.div
              key="verifying"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
            >
              <VerificationProgress progress={verification.progress} />
            </motion.div>
          )}

          {/* ── Review ──────────────────────────────────────────────────── */}
          {step === 'review' && (
            <motion.div
              key="review"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stepTransition}
              className="space-y-4"
            >
              {/* Review header with back link */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToUpload}
                  className="flex items-center gap-1.5 font-sans text-text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150"
                >
                  <ArrowLeft size={14} />
                  Back to upload
                </button>
              </div>

              {/* Summary + filter bar */}
              <VerificationSummaryBar
                summary={verification.summary}
                filter={verification.filter}
                selected={verification.selected}
                onFilterChange={verification.setFilter}
                onRetryFailed={handleRetryFailed}
                onRemoveSelected={verification.removeSelected}
                isRetrying={isRetrying}
              />

              {/* Verification table */}
              <VerificationTable
                rows={verification.filteredRows}
                selected={verification.selected}
                schema={schema}
                currentPage={verifyPage}
                totalPages={totalVerifyPages}
                onToggleSelect={verification.toggleSelect}
                onSelectAll={() =>
                  verification.selectAll(verification.filteredRows.map(r => r.id))
                }
                onClearSelection={verification.clearSelection}
                onDelete={verification.removeRow}
                onRetryRow={verification.retryRow}
                onPageChange={p => { setVerifyPage(p) }}
              />

              {/* Submit row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col gap-0.5">
                  {verification.summary.noMatch > 0 && (
                    <p className="font-sans text-text-sm text-danger-fg">
                      {verification.summary.noMatch} recipient{verification.summary.noMatch !== 1 ? 's' : ''} could not be matched — remove them before submitting.
                    </p>
                  )}
                  {verification.summary.failed > 0 && (
                    <p className="font-sans text-text-sm text-gray-400">
                      {verification.summary.failed} row{verification.summary.failed !== 1 ? 's' : ''} failed lookup — retry or remove before submitting.
                    </p>
                  )}
                  {verification.summary.partialMatch > 0 && verification.canSubmit && (
                    <p className="font-sans text-text-sm text-warning-fg">
                      {verification.summary.partialMatch} partial match{verification.summary.partialMatch !== 1 ? 'es' : ''} — please review names carefully.
                    </p>
                  )}
                </div>

                <div className="ml-auto">
                  <motion.button
                    whileHover={!verification.canSubmit || isSubmitting ? {} : { scale: 1.02 }}
                    whileTap={!verification.canSubmit || isSubmitting ? {} : { scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={handleSubmit}
                    disabled={!verification.canSubmit || isSubmitting}
                    className="btn-gradient text-white font-sans font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Submit{' '}
                        {verification.summary.total > 0
                          ? `${verification.summary.total} Disbursement${verification.summary.total !== 1 ? 's' : ''}`
                          : 'Disbursements'}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Existing confirm modal — wiring unchanged */}
      <ConfirmDisbursementModal
        open={showConfirmModal}
        totalRecipients={totalRecipients}
        totalAmount={totalAmount}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
      />
    </PageTransition>
  )
}
