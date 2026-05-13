import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Send, Users, Banknote } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'

interface ConfirmDisbursementModalProps {
  open: boolean
  totalRecipients: number
  totalAmount: number
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDisbursementModal: React.FC<ConfirmDisbursementModalProps> = ({
  open,
  totalRecipients,
  totalAmount,
  isSubmitting,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-semibold text-text-xl text-gray-900">
            Confirm Bulk Disbursement
          </DialogTitle>
          <DialogDescription className="font-sans text-text-md text-gray-500">
            Review the summary below before sending.
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <SummaryRow
            icon={<Users size={15} className="text-gray-400" />}
            label="Total Recipients"
            value={String(totalRecipients)}
            mono
          />
          <div className="h-px bg-gray-100" />
          <SummaryRow
            icon={<Banknote size={15} className="text-gp-cobalt" />}
            label="Total Amount"
            value={formatCurrency(totalAmount)}
            highlight
          />
        </div>

        <p className="font-sans text-text-xs text-gray-400">
          This action cannot be undone. Funds will be disbursed immediately after confirmation.
        </p>

        <DialogFooter className="gap-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-white border border-gray-200 text-gray-700 font-sans font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>

          <motion.button
            whileHover={isSubmitting ? {} : { scale: 1.02 }}
            whileTap={isSubmitting ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            onClick={onConfirm}
            disabled={isSubmitting}
            className="btn-gradient text-white font-sans font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Send size={14} />
                Confirm & Send
              </>
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SummaryRowProps {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}

const SummaryRow: React.FC<SummaryRowProps> = ({ icon, label, value, mono, highlight }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-sans text-text-sm text-gray-500">{label}</span>
    </div>
    <span
      className={
        highlight
          ? 'font-display font-bold text-display-xs text-gradient-brand tabular-nums'
          : mono
          ? 'font-mono text-text-sm font-medium text-gray-900 tabular-nums'
          : 'font-sans text-text-sm text-gray-900'
      }
    >
      {value}
    </span>
  </div>
)
