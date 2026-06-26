'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('total_points').eq('id', data.user.id).single()
          .then(({ data: p }) => { if (p) setPoints(p.total_points) })
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo">⚽ جام جهانی <span>۲۰۲۶</span></Link>
        <div className="navbar-links">
          {user ? (
            <>
              <span className="points-badge">🏆 {points} امتیاز</span>
              <button onClick={logout} className="nav-btn nav-btn-ghost">خروج</button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-btn nav-btn-ghost">ورود</Link>
              <Link href="/register" className="nav-btn nav-btn-primary">ثبت‌نام</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
