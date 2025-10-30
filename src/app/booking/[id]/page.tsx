"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'owner'
  
  // Debug: log the role to see what's happening
  console.log('Booking page role:', role)
  const [step, setStep] = useState(1) // 1: Details, 2: Payment, 3: Confirmation
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    service: '',
    petName: '',
    petType: '',
    customAnimalType: '',
    petBreed: '',
    specialInstructions: '',
    recurringBooking: false,
    recurringDays: []
  })

  // Mock caregiver data
  const caregiver = {
    id: 1,
    name: 'Emma Willems',
    city: 'Brussel',
    hourlyRate: 15,
    photo: '',
    services: [
      { name: 'Hondenuitlaat', price: 15, duration: '30-60 min' },
      { name: 'Oppas thuis', price: 15, duration: 'Per uur' },
      { name: 'Training', price: 25, duration: '60 min' }
    ]
  }

  const calculateTotal = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0
    
    const start = new Date(`2000-01-01 ${bookingData.startTime}`)
    const end = new Date(`2000-01-01 ${bookingData.endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    
    const selectedService = caregiver.services.find(s => s.name === bookingData.service)
    const hourlyRate = selectedService?.price || caregiver.hourlyRate
    
    return Math.max(hours * hourlyRate, hourlyRate) // Minimum 1 hour
  }

  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc'
  }

  const headerStyle = {
    background: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }

  const navStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const backButtonStyle = {
    background: 'transparent',
    border: '2px solid #4f46e5',
    color: '#4f46e5',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500'
  }

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#4f46e5',
    textDecoration: 'none'
  }

  const mainStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  }

  const cardStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    marginBottom: '1rem'
  }

  const buttonStyle = {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '1rem'
  }

  const stepIndicatorStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '3rem'
  }

  const stepStyle = (stepNumber: number) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: step >= stepNumber ? '#4f46e5' : '#e5e7eb',
    color: step >= stepNumber ? 'white' : '#6b7280',
    fontWeight: '600',
    marginRight: stepNumber < 3 ? '2rem' : 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Boeking Details</h1>
              <p className="text-sm text-gray-600">Boeking #1234 - {caregiver.name}</p>
            </div>
            <Link href="/bookings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Boekingen
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold`}>1</div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold`}>2</div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold`}>3</div>
        </div>

        {/* Caregiver Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
              {caregiver.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {caregiver.name}
              </h2>
              <p className="text-gray-600">📍 {caregiver.city}</p>
            </div>
          </div>
        </div>

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Boekingsdetails
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Datum *
                </label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) => setBookingData(prev => ({...prev, date: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Dienst *
                </label>
                <select
                  value={bookingData.service}
                  onChange={(e) => setBookingData(prev => ({...prev, service: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Kies een dienst</option>
                  {caregiver.services.map(service => (
                    <option key={service.name} value={service.name}>
                      {service.name} - €{service.price}/uur ({service.duration})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Starttijd *
                </label>
                <select
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData(prev => ({...prev, startTime: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Kies starttijd</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Eindtijd *
                </label>
                <select
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData(prev => ({...prev, endTime: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Kies eindtijd</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Naam van huisdier *
                </label>
                <input
                  type="text"
                  value={bookingData.petName}
                  onChange={(e) => setBookingData(prev => ({...prev, petName: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Max"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Type huisdier *
                </label>
                <select
                  value={bookingData.petType}
                  onChange={(e) => setBookingData(prev => ({...prev, petType: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Kies type</option>
                  <option value="hond">Hond</option>
                  <option value="kat">Kat</option>
                  <option value="konijn">Konijn</option>
                  <option value="vogel">Vogel</option>
                  <option value="anders">Anders</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Ras *
                </label>
                <input
                  type="text"
                  value={bookingData.petBreed}
                  onChange={(e) => setBookingData(prev => ({...prev, petBreed: e.target.value}))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Bijv. Golden Retriever, Pers, Siamees, etc."
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">
                Speciale instructies
              </label>
              <textarea
                value={bookingData.specialInstructions}
                onChange={(e) => setBookingData(prev => ({...prev, specialInstructions: e.target.value}))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px] resize-y"
                placeholder="Vertel Emma over eventuele speciale behoeften, gewoontes, of instructies voor jouw huisdier..."
              />
            </div>

            <div style={{marginBottom: '2rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <input
                  type="checkbox"
                  checked={bookingData.recurringBooking}
                  onChange={(e) => setBookingData(prev => ({...prev, recurringBooking: e.target.checked}))}
                />
                <span style={{fontWeight: '500'}}>Terugkerende boeking</span>
              </label>
              <p style={{color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem'}}>
                Herhaal deze boeking wekelijks
              </p>
            </div>

            {calculateTotal() > 0 && (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <h4 style={{fontWeight: '600', marginBottom: '0.5rem'}}>Kostenoverzicht</h4>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                  <span>Dienst: {bookingData.service}</span>
                  <span>€{caregiver.services.find(s => s.name === bookingData.service)?.price || caregiver.hourlyRate}/uur</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem'}}>
                  <span>Duur: {bookingData.startTime} - {bookingData.endTime}</span>
                  <span>{Math.max(1, Math.round(((new Date(`2000-01-01 ${bookingData.endTime}`).getTime() - new Date(`2000-01-01 ${bookingData.startTime}`).getTime()) / (1000 * 60 * 60)) * 10) / 10)} uur</span>
                </div>
                <hr style={{margin: '0.5rem 0', border: 'none', borderTop: '1px solid #0ea5e9'}} />
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '1.1rem'}}>
                  <span>Totaal:</span>
                  <span>€{calculateTotal()}</span>
                </div>
              </div>
            )}

            <button
              style={{...buttonStyle, opacity: calculateTotal() > 0 ? 1 : 0.5}}
              disabled={calculateTotal() === 0}
              onClick={() => setStep(2)}
            >
              Doorgaan naar Betaling
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div style={cardStyle}>
            <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem'}}>
              Betaling
            </h3>

            {/* Booking Summary */}
            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{fontWeight: '600', marginBottom: '1rem'}}>Samenvatting Boeking</h4>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem'}}>
                <span style={{color: '#6b7280'}}>Oppas:</span>
                <span>{caregiver.name}</span>
                <span style={{color: '#6b7280'}}>Datum:</span>
                <span>{bookingData.date}</span>
                <span style={{color: '#6b7280'}}>Tijd:</span>
                <span>{bookingData.startTime} - {bookingData.endTime}</span>
                <span style={{color: '#6b7280'}}>Dienst:</span>
                <span>{bookingData.service}</span>
                <span style={{color: '#6b7280'}}>Huisdier:</span>
                <span>{bookingData.petName} ({bookingData.petType === 'OTHER' && bookingData.customAnimalType ? bookingData.customAnimalType : bookingData.petType}) - {bookingData.petBreed}</span>
                <span style={{color: '#6b7280', fontWeight: '600'}}>Totaal:</span>
                <span style={{fontWeight: '600'}}>€{calculateTotal()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div style={{marginBottom: '2rem'}}>
              <h4 style={{fontWeight: '600', marginBottom: '1rem'}}>Betaalmethode</h4>
              
              <div style={{border: '1px solid #d1d5db', borderRadius: '0.5rem', overflow: 'hidden'}}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="payment" value="card" defaultChecked style={{marginRight: '0.75rem'}} />
                  <span>Credit/Debit Card</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #d1d5db',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="payment" value="paypal" style={{marginRight: '0.75rem'}} />
                  <span>PayPal</span>
                </label>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  cursor: 'pointer'
                }}>
                  <input type="radio" name="payment" value="bancontact" style={{marginRight: '0.75rem'}} />
                  <span>Bancontact</span>
                </label>
              </div>
            </div>

            {/* Card Details */}
            <div style={{marginBottom: '2rem'}}>
              <h4 style={{fontWeight: '600', marginBottom: '1rem'}}>Kaartgegevens</h4>
              
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  Kaartnummer
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  style={inputStyle}
                />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                    Vervaldatum
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500'}}>
                  Naam op kaart
                </label>
                <input
                  type="text"
                  placeholder="Jan Janssen"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                style={{...buttonStyle, background: '#6b7280'}}
                onClick={() => setStep(1)}
              >
                Terug
              </button>
              <button
                style={buttonStyle}
                onClick={() => setStep(3)}
              >
                Betalen €{calculateTotal()}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div style={cardStyle}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <h3 style={{fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '1rem'}}>
                Boeking Bevestigd!
              </h3>
              <p style={{color: '#6b7280', fontSize: '1.1rem'}}>
                Je boeking is succesvol geplaatst en bevestigd.
              </p>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '0.5rem',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{fontWeight: '600', marginBottom: '1rem', color: '#10b981'}}>
                Boekingsdetails
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                <span style={{color: '#6b7280'}}>Boeking ID:</span>
                <span style={{fontWeight: '600'}}>#TB{Math.floor(Math.random() * 10000)}</span>
                <span style={{color: '#6b7280'}}>Oppas:</span>
                <span>{caregiver.name}</span>
                <span style={{color: '#6b7280'}}>Datum & Tijd:</span>
                <span>{bookingData.date} om {bookingData.startTime}</span>
                <span style={{color: '#6b7280'}}>Service:</span>
                <span>{bookingData.service}</span>
                <span style={{color: '#6b7280'}}>Totaal Betaald:</span>
                <span style={{fontWeight: '600'}}>€{calculateTotal()}</span>
              </div>
            </div>

            <div style={{
              background: '#fefce8',
              border: '1px solid #f59e0b',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h4 style={{fontWeight: '600', marginBottom: '0.5rem', color: '#f59e0b'}}>
                Wat nu?
              </h4>
              <ul style={{color: '#6b7280', paddingLeft: '1.5rem'}}>
                <li>Je ontvangt een bevestigingsmail met alle details</li>
                <li>Emma ontvangt een notificatie over je boeking</li>
                <li>Je kunt berichten uitwisselen via je dashboard</li>
                <li>24 uur voor de afspraak krijg je een herinnering</li>
              </ul>
            </div>

            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <Link href="/dashboard/caregiver" style={{...buttonStyle, textDecoration: 'none'}}>
                Naar dashboard
              </Link>
              <Link href={`/caregiver/${caregiver.id}`} style={{
                ...buttonStyle,
                background: 'transparent',
                color: '#4f46e5',
                border: '2px solid #4f46e5',
                textDecoration: 'none'
              }}>
                Bericht sturen
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

