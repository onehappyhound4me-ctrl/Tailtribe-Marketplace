'use client'

import { useState } from 'react'

interface BadgeUploadFieldProps {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  icon?: string
  required?: boolean
}

export function BadgeUploadField({ 
  label, 
  description, 
  value, 
  onChange,
  icon = '●',
  required = false 
}: BadgeUploadFieldProps) {
  const [isChecked, setIsChecked] = useState(!!value)

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            setIsChecked(e.target.checked)
            if (!e.target.checked) {
              onChange('')
            }
          }}
          className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5 flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
              {label}
            </span>
            {required && <span className="text-red-500 text-xs">*</span>}
          </div>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </label>

      {isChecked && (
        <div className="ml-8 mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // TODO: Upload to server and get URL
                  onChange(file.name) // Temporary: just store filename
                }
              }}
              className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>
          {value && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Geüpload: {value}</span>
            </div>
          )}
          <p className="text-xs text-gray-500 italic">
            Toegestane formaten: PDF, JPG, PNG (max 5MB)
          </p>
        </div>
      )}
    </div>
  )
}


























