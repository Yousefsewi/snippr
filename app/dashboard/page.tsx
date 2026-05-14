'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Barber {
  id: string
  name: string
  slug: string
  user_id: string
}

interface Appointment {
  id: string
  customer_name: string
  customer_email: string
  date: string
  time: string
  service: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [barber, setBarber] = useState<Barber | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      router.push('/login')
      return
    }

    // Fetch barber data
    const { data: barberData, error: barberError } = await supabase
      .from('barbers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (barberError || !barberData) {
      console.error('Error fetching barber data:', barberError)
      setLoading(false)
      return
    }

    setBarber(barberData)

    // Fetch today's appointments
    const today = new Date().toISOString().split('T')[0]
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('barber_id', barberData.id)
      .eq('date', today)
      .order('time', { ascending: true })

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
    } else {
      setAppointments(appointmentsData || [])
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    )
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <div style={{ color: 'white' }}>Barber profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b" style={{ borderColor: '#1A1A1A' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'white' }}>
          Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#6366F1' }}
        >
          Logout
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Barber Info */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'white' }}>
            Welcome, {barber.name}
          </h2>
          <div className="space-y-2">
            <p style={{ color: '#9CA3AF' }}>
              <span style={{ color: 'white', fontWeight: '500' }}>Your booking link:</span>
            </p>
            <div className="flex items-center gap-2">
              <code className="px-3 py-2 rounded text-sm" style={{ backgroundColor: '#0A0A0A', color: '#6366F1' }}>
                snippr.app/{barber.slug}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(`snippr.app/${barber.slug}`)}
                className="px-3 py-2 rounded text-sm text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#6366F1' }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'white' }}>
            Today's Appointments
          </h2>
          {appointments.length === 0 ? (
            <p style={{ color: '#9CA3AF' }}>No appointments for today</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: '#2A2A2A' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium" style={{ color: 'white' }}>
                        {appointment.customer_name}
                      </h3>
                      <p style={{ color: '#9CA3AF' }}>{appointment.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium" style={{ color: '#6366F1' }}>
                        {appointment.time}
                      </p>
                      <p style={{ color: '#9CA3AF' }}>{appointment.service}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
