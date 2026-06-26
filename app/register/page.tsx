'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister() {
    setLoading(true)
    setError('')
    if (!username.trim()) { setError('نام کاربری را وارد کنید'); setLoading(false); return }
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, username: username.trim(), total_points: 0 })
      if (profileError) { setError(profileError.message); setLoading(false); return }
    }
    setSuccess('ثبت‌نام موفق! در حال انتقال...')
    setTimeout(() => router.push('/'), 1500)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🏆</div>
        <div className="auth-title">ثبت‌نام</div>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <div className="form-group">
          <label className="form-label">نام کاربری</label>
          <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="مثلاً: ali_football" />
        </div>
        <div className="form-group">
          <label className="form-label">ایمیل</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">رمز عبور</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" />
        </div>
        <button className="btn-submit" onClick={handleRegister} disabled={loading}>
          {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
        </button>
        <div className="auth-link">
          حساب دارید؟ <Link href="/login">وارد شوید</Link>
        </div>
      </div>
    </div>
  )
          }
