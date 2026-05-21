'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

interface Barber {
  id: string
  name: string
  slug: string
  email: string
}

const services = [
  { id: 'haircut', name: 'Haircut', duration: '30min' },
  { id: 'beard', name: 'Beard', duration: '15min' }
]

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const [barber, setBarber] = useState<Barber | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [submitting, setSubmitting] = useState(false)

useEffect(() => {
  fetchBarber()
}, [slug])

  const fetchBarber = async () => {
    const fetchServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('barber_id', barber?.id)

  if (error) {
    console.log(error)
    return
  }

  setServices(data || [])
}
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      setError('Barber not found')
      setLoading(false)
      return
    }

    setBarber(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!barber) {
      setError('Barber not found')
      setSubmitting(false)
      return
    }

    // Calculate duration based on selected service
    const service = services.find(s => s.name === selectedService)
    const durationMinutes = service?.duration === '30min' ? 30 : 15

    // Combine date and time into timestamp
    const startDateTime = new Date(`${selectedDate}T${selectedTime}`)
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000)
const { data: existing } = await supabase
  .from('appointments')
  .select('*')
  .eq('barber_id', barber.id)
  .eq('start_time', startDateTime.toISOString())

if (existing && existing.length > 0) {
  setError('This time slot is already booked')
  setSubmitting(false)
  return
}
    const { error } = await supabase
      .from('appointments')
      .insert({
        barber_id: barber.id,
        customer_name: customerName,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'pending'
      })

    if (error) {
      setError('Failed to create appointment: ' + error.message)
      setSubmitting(false)
      return
    }

    alert('Appointment booked successfully!')
    setCustomerName('')
    setSelectedService('')
    setSelectedDate('')
    setSelectedTime('')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    )
  }

  if (error || !barber) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div style={{ color: 'white' }}>{error || 'Barber not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: 'white' }}>
          Book with {barber.name}
        </h1>
        <p className="text-center mb-8" style={{ color: '#9CA3AF' }}>
          Select a service, date, and time to book your appointment
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'white' }}>
              Select Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedService === service.name
                      ? 'border-indigo-500'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  style={{
                    backgroundColor: '#1A1A1A',
                    borderColor: selectedService === service.name ? '#6366F1' : '#374151'
                  }}
                >
                  <div className="font-medium" style={{ color: 'white' }}>
                    {service.name}
                  </div>
                  <div style={{ color: '#9CA3AF' }}>{service.duration}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'white' }}>
              Select Date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              style={{ backgroundColor: '#1A1A1A' }}
            />
          </div>

          {/* Time Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'white' }}>
              Select Time
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-3 rounded-lg transition-all ${
                    selectedTime === time
                      ? 'bg-indigo-500'
                      : 'hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: selectedTime === time ? '#6366F1' : '#1A1A1A',
                    color: 'white'
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'white' }}>
              Your Information
            </h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
                Name
              </label>
              <input
                id="name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                style={{ backgroundColor: '#1A1A1A' }}
                placeholder="Enter your name"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedService || !selectedDate || !selectedTime}
            className="w-full py-4 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: '#6366F1' }}
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  )
}
