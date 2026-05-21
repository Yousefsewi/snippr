'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Extract email prefix for name and slug
      const emailPrefix = email.split('@')[0]
      
      // Create barber record
      const { error: barberError } = await supabase
        .from('barbers')
        .insert({
          user_id: authData.user.id,
          email: email,
          name: emailPrefix,
          slug: emailPrefix.toLowerCase()
        })

      if (barberError) {
        setError('Account created but failed to create barber profile: ' + barberError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: 'white' }}>
          Register
        </h1>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              style={{ backgroundColor: '#1A1A1A' }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'white' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              style={{ backgroundColor: '#1A1A1A' }}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: '#6366F1' }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: '#9CA3AF' }}>
          Already have an account?{' '}
          <a href="/login" className="hover:underline" style={{ color: '#6366F1' }}>
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
