'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚽</div>
        <div className="auth-title">ورود به سایت</div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">ایمیل</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">رمز عبور</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button className="btn-submit" onClick={handleLogin} disabled={loading}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
        <div className="auth-link">
          حساب ندارید؟ <Link href="/register">ثبت‌نام کنید</Link>
        </div>
      </div>
    </div>
  )
        }
