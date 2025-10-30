'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const CERTIFICATE_TYPES = [
  { value: 'EHBO', label: '🏥 EHBO Gecertificeerd', color: 'red' },
  { value: 'DOG_BEHAVIOR', label: '🐕 Hondengedrag Training', color: 'blue' },
  { value: 'VET_ASSISTANT', label: '🏥 Dierenarts Assistent', color: 'green' },
  { value: 'PET_GROOMING', label: '✂️ Trimsalon Diploma', color: 'purple' },
  { value: 'INSURANCE', label: '🛡️ Verzekerd', color: 'indigo' },
  { value: 'ID_VERIFIED', label: '✓ ID Geverifieerd', color: 'emerald' },
  { value: 'BACKGROUND_CHECK', label: '✓ VOG (Verklaring Omtrent Gedrag)', color: 'teal' },
]

interface Certificate {
  type: string
  fileUrl?: string
  verified: boolean
  date?: string
}

interface CertificatesManagerProps {
  certificates?: Certificate[]
  onUpdate?: (certs: Certificate[]) => void
}

export function CertificatesManager({ certificates = [], onUpdate }: CertificatesManagerProps) {
  const [certs, setCerts] = useState<Certificate[]>(certificates)
  const [uploading, setUploading] = useState<string | null>(null)

  const handleAddCertificate = (type: string) => {
    const newCert: Certificate = {
      type,
      verified: false,
      date: new Date().toISOString()
    }
    const updated = [...certs, newCert]
    setCerts(updated)
    onUpdate?.(updated)
    toast.success('Certificaat toegevoegd! Upload het bewijs.')
  }

  const handleUploadProof = async (certType: string, file: File) => {
    setUploading(certType)
    try {
      // Upload file (simplified - you can integrate with cloud storage)
      const formData = new FormData()
      formData.append('certificate', file)
      formData.append('type', certType)

      // For now, just mark as uploaded
      const updated = certs.map(c => 
        c.type === certType 
          ? { ...c, fileUrl: `/uploads/cert-${Date.now()}.pdf`, verified: false }
          : c
      )
      setCerts(updated)
      onUpdate?.(updated)
      toast.success('Bewijs geüpload! Admin moet goedkeuren.')
    } catch (error) {
      toast.error('Fout bij uploaden')
    } finally {
      setUploading(null)
    }
  }

  const handleRemove = (certType: string) => {
    const updated = certs.filter(c => c.type !== certType)
    setCerts(updated)
    onUpdate?.(updated)
    toast.success('Certificaat verwijderd')
  }

  const getCertificateLabel = (type: string) => {
    return CERTIFICATE_TYPES.find(c => c.value === type)?.label || type
  }

  const getCertificateColor = (type: string) => {
    const color = CERTIFICATE_TYPES.find(c => c.value === type)?.color || 'gray'
    return {
      red: 'bg-red-100 text-red-700 border-red-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
    }[color] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const activeCertTypes = certs.map(c => c.type)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Certificaten & Diploma's</h3>
        <p className="text-sm text-gray-600 mb-4">
          Voeg certificaten toe om je professionaliteit te tonen. Upload bewijsstukken voor verificatie.
        </p>
      </div>

      {/* Active Certificates */}
      {certs.length > 0 && (
        <div className="space-y-3">
          {certs.map((cert) => (
            <div key={cert.type} className={`border rounded-xl p-4 ${getCertificateColor(cert.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {getCertificateLabel(cert.type)}
                    </span>
                    {cert.verified && (
                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                        ✓ Geverifieerd
                      </span>
                    )}
                    {!cert.verified && cert.fileUrl && (
                      <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
                        ⏳ In review
                      </span>
                    )}
                  </div>
                  
                  {!cert.fileUrl && (
                    <div className="mt-2">
                      <input
                        type="file"
                        id={`cert-${cert.type}`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUploadProof(cert.type, file)
                        }}
                        className="hidden"
                      />
                      <label htmlFor={`cert-${cert.type}`}>
                        <Button
                          type="button"
                          size="sm"
                          disabled={uploading === cert.type}
                          className="cursor-pointer"
                          onClick={() => document.getElementById(`cert-${cert.type}`)?.click()}
                        >
                          {uploading === cert.type ? 'Uploaden...' : 'Upload bewijs'}
                        </Button>
                      </label>
                    </div>
                  )}

                  {cert.fileUrl && (
                    <p className="text-xs mt-1">Bewijs geüpload - wacht op goedkeuring</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(cert.type)}
                  className="text-gray-400 hover:text-red-600 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Certificate Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-2">Certificaat toevoegen</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CERTIFICATE_TYPES.filter(ct => !activeCertTypes.includes(ct.value)).map((cert) => (
            <button
              key={cert.value}
              type="button"
              onClick={() => handleAddCertificate(cert.value)}
              className="text-left p-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all"
            >
              <span className="text-sm font-medium">{cert.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Certificaten verhogen je geloofwaardigheid en zichtbaarheid in zoekresultaten!
        </p>
      </div>
    </div>
  )
}




