'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY
const WC_ID = 'WC'

const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦', 'Brazil': '🇧🇷',
  'Argentina': '🇦🇷', 'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸',
  'England': '🏴󠁧󠁢󠁥󠁮󠁬󠁿', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
  'Italy': '🇮🇹', 'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
  'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Nigeria': '🇳🇬', 'Ghana': '🇬🇭',
  'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Qatar': '🇶🇦', 'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴', 'Chile': '🇨🇱', 'Ecuador': '🇪🇨', 'Peru': '🇵🇪',
  'Poland': '🇵🇱', 'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Switzerland': '🇨🇭',
  'Denmark': '🇩🇰', 'Sweden': '🇸🇪', 'Austria': '🇦🇹', 'Ukraine': '🇺🇦',
  'Turkey': '🇹🇷', 'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺', 'Romania': '🇷🇴',
  'Greece': '🇬🇷', 'Egypt': '🇪🇬', 'Algeria': '🇩🇿', 'Tunisia': '🇹🇳',
  'Cameroon': '🇨🇲', 'Ivory Coast': '🇨🇮', 'United Arab Emirates': '🇦🇪',
  'Indonesia': '🇮🇩', 'Panama': '🇵🇦', 'Costa Rica': '🇨🇷', 'Honduras': '🇭🇳',
  'Jamaica': '🇯🇲', 'Venezuela': '🇻🇪', 'Bolivia': '🇧🇴', 'Paraguay': '🇵🇾',
}

function getFlag(name: string) {
  return COUNTRY_FLAGS[name] || '🏳️'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
export default function Home() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'matches' | 'leaderboard'>('matches')
  const [stage, setStage] = useState('همه')
  const [user, setUser] = useState<any>(null)
  const [predictions, setPredictions] = useState<Record<number, any>>({})
  const [modal, setModal] = useState<any>(null)
  const [homeScore, setHomeScore] = useState('0')
  const [awayScore, setAwayScore] = useState('0')
  const [saving, setSaving] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    fetchMatches()
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    if (user) fetchPredictions()
  }, [user])

  async function fetchMatches() {
    setLoading(true)
    try {
      const res = await fetch('https://worldcup26.ir/get/games')
      const data = await res.json()
      const stageTypeMap: Record<string, string> = {
        group: 'GROUP_STAGE',
        r32: 'ROUND_32',
        r16: 'LAST_16',
        qf: 'QUARTER_FINALS',
        sf: 'SEMI_FINALS',
        f: 'FINAL',
      }
      const mapped = (data.games || []).map((m: any) => ({
        id: m.id,
        utcDate: m.local_date,
        status: (m.finished === 'TRUE' || m.finished === true) ? 'FINISHED' : 'SCHEDULED',
        stage: stageTypeMap[m.type] || 'GROUP_STAGE',
        homeTeam: { name: m.home_team_name_en || m.home_team_label || '?' },
        awayTeam: { name: m.away_team_name_en || m.away_team_label || '?' },
        score: {
          fullTime: {
            home: m.home_score !== undefined && m.home_score !== null ? Number(m.home_score) : null,
            away: m.away_score !== undefined && m.away_score !== null ? Number(m.away_score) : null,
          }
        }
      }))
      setMatches(mapped)
    } catch {
      setMatches([])
    }
    setLoading(false)
  }
  async function fetchPredictions() {
    const { data } = await supabase.from('predictions').select('*').eq('user_id', user.id)
    const map: Record<number, any> = {}
    data?.forEach((p: any) => { map[p.match_id] = p })
    setPredictions(map)
  }

  async function fetchLeaderboard() {
    const { data } = await supabase.from('profiles').select('username, total_points').order('total_points', { ascending: false }).limit(20)
    setLeaderboard(data || [])
  }

  function openModal(match: any) {
    if (!user) { window.location.href = '/login'; return }
    const existing = predictions[match.id]
    setHomeScore(existing ? String(existing.home_score) : '0')
    setAwayScore(existing ? String(existing.away_score) : '0')
    setModal(match)
  }

  async function savePrediction() {
    if (!user || !modal) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      match_id: modal.id,
      home_score: parseInt(homeScore) || 0,
      away_score: parseInt(awayScore) || 0,
    }
    const existing = predictions[modal.id]
    if (existing) {
      await supabase.from('predictions').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('predictions').insert(payload)
    }
    await fetchPredictions()
    setSaving(false)
    setModal(null)
  }

  const stages = ['همه', 'Group Stage', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final']
  const stageMap: Record<string, string> = {
    'همه': '', 'Group Stage': 'GROUP_STAGE', 'Round of 16': 'LAST_16',
    'Quarter-Finals': 'QUARTER_FINALS', 'Semi-Finals': 'SEMI_FINALS', 'Final': 'FINAL'
  }

  const filtered = matches.filter(m => stage === 'همه' || m.stage === stageMap[stage])
  const isLive = (m: any) => m.status === 'IN_PLAY' || m.status === 'PAUSED'
  const isFinished = (m: any) => m.status === 'FINISHED'
  const canPredict = (m: any) => m.status === 'TIMED' || m.status === 'SCHEDULED'
  return (
    <>
      <Navbar />
      <div className="hero">
        <div className="container">
          <h1>🏆 جام جهانی ۲۰۲۶</h1>
          <p>نتایج زنده · پیش‌بینی بازی‌ها · رقابت با دوستان</p>
        </div>
      </div>

      <div style={{ background: 'var(--dark2)', borderBottom: '1px solid var(--dark3)' }}>
        <div className="container">
          <div className="tabs">
            <button className={`tab ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>بازی‌ها</button>
            <button className={`tab ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>جدول امتیازات</button>
          </div>
        </div>
      </div>

      <div className="container">
        {tab === 'matches' && (
          <>
            <div className="stage-filter">
              {stages.map(s => (
                <button key={s} className={`stage-btn ${stage === s ? 'active' : ''}`} onClick={() => setStage(s)}>{s}</button>
              ))}
            </div>
            {loading ? (
              <div className="loading"><div className="spinner" />در حال بارگذاری...</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state"><div className="emoji">⚽</div><p>بازی‌ای در این مرحله وجود ندارد</p></div>
            ) : (
              <div className="matches-grid">
                {filtered.map((match: any) => (
                  <div key={match.id} className="match-card">
                    <div className="match-meta">
                      <span className={`match-badge ${isLive(match) ? 'live' : ''}`}>
                        {isLive(match) ? '🔴 زنده' : isFinished(match) ? '✅ پایان' : '🕐 برنامه‌ریزی شده'}
                      </span>
                      <span>{formatDate(match.utcDate)}</span>
                    </div>
                    <div className="match-teams">
                      <div className="team">
                        <span className="team-flag">{getFlag(match.homeTeam?.name)}</span>
                        <span className="team-name">{match.homeTeam?.name || '?'}</span>
                      </div>
                      <div className="score-box">
                        <span>{isLive(match) || isFinished(match) ? (match.score?.fullTime?.home ?? '-') : '-'}</span>
                        <span className="score-sep">:</span>
                        <span>{isLive(match) || isFinished(match) ? (match.score?.fullTime?.away ?? '-') : '-'}</span>
                      </div>
                      <div className="team">
                        <span className="team-flag">{getFlag(match.awayTeam?.name)}</span>
                        <span className="team-name">{match.awayTeam?.name || '?'}</span>
                      </div>
                    </div>
                    {predictions[match.id] && (
                      <div className="my-prediction">
                        <span>پیش‌بینی من:</span>
                        <strong>{predictions[match.id].home_score} - {predictions[match.id].away_score}</strong>
                        {predictions[match.id].points > 0 && <span>🏅 {predictions[match.id].points} امتیاز</span>}
                      </div>
                    )}
                    {canPredict(match) && (
                      <button className="match-predict-btn" onClick={() => openModal(match)}>
                        {predictions[match.id] ? '✏️ ویرایش پیش‌بینی' : '🎯 پیش‌بینی کن'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {tab === 'leaderboard' && (
          <div className="leaderboard">
            {leaderboard.length === 0 ? (
              <div className="empty-state"><div className="emoji">🏆</div><p>هنوز کسی پیش‌بینی نکرده</p></div>
            ) : leaderboard.map((u, i) => (
              <div key={i} className="lb-row">
                <span className={`lb-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className="lb-name">{u.username}</span>
                <span className="lb-points">{u.total_points}<span className="lb-pts-label"> pts</span></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {getFlag(modal.homeTeam?.name)} {modal.homeTeam?.name} vs {modal.awayTeam?.name} {getFlag(modal.awayTeam?.name)}
            </div>
            <div className="score-input-row">
              <div className="score-input-group">
                <label>{modal.homeTeam?.name}</label>
                <input type="number" min="0" max="20" className="score-input" value={homeScore} onChange={e => setHomeScore(e.target.value)} />
              </div>
              <span className="modal-vs">:</span>
              <div className="score-input-group">
                <label>{modal.awayTeam?.name}</label>
                <input type="number" min="0" max="20" className="score-input" value={awayScore} onChange={e => setAwayScore(e.target.value)} />
              </div>
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setModal(null)}>انصراف</button>
              <button className="btn-save" onClick={savePrediction} disabled={saving}>
                {saving ? 'در حال ذخیره...' : '💾 ذخیره پیش‌بینی'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
                  }
