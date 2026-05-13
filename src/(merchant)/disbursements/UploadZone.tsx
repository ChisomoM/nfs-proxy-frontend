import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileParsed: (file: File) => void
  isDragging: boolean
  setIsDragging: (v: boolean) => void
}

function isValidCsv(file: File): boolean {
  return file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileParsed, isDragging, setIsDragging }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!isValidCsv(file)) {
      toast.error('Please upload a .csv file')
      return
    }
    onFileParsed(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isValidCsv(file)) {
      toast.error('Please upload a .csv file')
      return
    }
    onFileParsed(file)
    e.target.value = ''
  }

  return (
    <motion.label
      htmlFor="csv-upload"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={{
        borderColor: isDragging ? '#2563EB' : '#e5e7eb',
        backgroundColor: isDragging ? 'rgba(37, 99, 235, 0.03)' : 'rgba(255,255,255,0)',
      }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex flex-col items-center justify-center gap-5 p-16 rounded-2xl border-2 border-dashed cursor-pointer',
        'bg-white hover:border-gp-cobalt/60 hover:bg-gp-cobalt/[0.015] transition-colors duration-150',
      )}
    >
      {/* Icon */}
      <motion.div
        animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gp-cobalt/10 to-gp-sky/10 flex items-center justify-center"
      >
        <UploadCloud size={32} className="text-gp-cobalt" />
      </motion.div>

      {/* Text */}
      <div className="text-center space-y-1">
        <p className="font-display font-semibold text-text-xl text-gray-900">
          {isDragging ? 'Drop your CSV here' : 'Drag & drop your CSV here'}
        </p>
        <p className="font-sans text-text-md text-gray-500">
          or <span className="text-gp-cobalt font-medium">click to browse</span>
        </p>
      </div>

      <span className="font-sans text-text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
        Accepted format: .csv only
      </span>

      <input
        id="csv-upload"
        type="file"
        accept=".csv,text/csv"
        ref={inputRef}
        onChange={handleChange}
        className="sr-only"
      />
    </motion.label>
  )
}
