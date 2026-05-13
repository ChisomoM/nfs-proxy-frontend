import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalRows: number
  onPageChange: (page: number) => void
}

const PAGE_SIZE = 25

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalRows,
  onPageChange,
}) => {
  const from = (currentPage - 1) * PAGE_SIZE + 1
  const to   = Math.min(currentPage * PAGE_SIZE, totalRows)

  return (
    <div className="flex items-center justify-between px-1 pt-3">
      <span className="font-sans text-text-xs text-gray-400">
        Showing {from}–{to} of {totalRows} rows
      </span>

      <div className="flex items-center gap-1">
        <NavButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          label="Previous page"
        >
          <ChevronLeft size={16} />
        </NavButton>

        <span className="font-sans text-text-sm text-gray-600 px-3 tabular-nums">
          {currentPage} / {totalPages}
        </span>

        <NavButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          label="Next page"
        >
          <ChevronRight size={16} />
        </NavButton>
      </div>
    </div>
  )
}

interface NavButtonProps {
  onClick: () => void
  disabled: boolean
  label: string
  children: React.ReactNode
}

const NavButton: React.FC<NavButtonProps> = ({ onClick, disabled, label, children }) => (
  <motion.button
    whileHover={disabled ? {} : { scale: 1.15 }}
    whileTap={disabled ? {} : { scale: 0.85 }}
    transition={{ type: 'spring', stiffness: 600, damping: 32 }}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={cn(
      'h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-150',
      disabled
        ? 'text-gray-200 cursor-not-allowed'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
    )}
  >
    {children}
  </motion.button>
)
