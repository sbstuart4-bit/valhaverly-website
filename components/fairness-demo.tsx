'use client'

import { useState, useEffect, useRef } from 'react'

/* ─── Design Tokens ─────────────────────────────────────────── */
const NAVY = '#203F5E'
const TEAL = '#1A7A6E'
const GOLD = '#F7B32F'
const BLUE = '#88B9D9'

/* ─── Score Ring ─────────────────────────────────────────────── */
function Ring({ score, size, stroke }: { score: number; size: number; stroke: string }) {
  const R = (size - 12) / 2
  const circ = 2 * Math.PI * R
  const offset = circ - (circ * Math.min(score, 100) / 100)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={stroke} strokeWidth={7}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: size * 0.22, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  )
}

/* ─── Wave Badge ─────────────────────────────────────────────── */
function WaveBadge({ wave }: { wave: 1 | 2 }) {
  return (
    <span style={{
      background: wave === 1 ? NAVY : TEAL, color: wave === 1 ? '#C8D8E8' : '#A8DDD6',
      fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 3,
    }}>
      WAVE {wave}
    </span>
  )
}

/* ─── Token Dots ─────────────────────────────────────────────── */
function TokenDots({ count, total, type }: { count: number; total: number; type: 'prime' | 'holiday' }) {
  const color = type === 'prime' ? GOLD : BLUE
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 18, height: 18, borderRadius: '50%',
          background: i < count ? color : 'rgba(255,255,255,0.08)',
          border: `1px solid ${i < count ? color : 'rgba(255,255,255,0.12)'}`,
          transition: 'all 0.5s',
        }} />
      ))}
    </div>
  )
}

/* ─── Member Card ────────────────────────────────────────────── */
interface MD {
  name: string; initials: string; color: string; wave: 1 | 2; score: number;
  prime: number; holiday: number; badge?: 'blocked' | 'approved' | 'up' | 'down'; dim?: boolean
}
function MemberCard({ m }: { m: MD }) {
  const badgeMap = {
    blocked:  { bg: 'rgba(192,57,43,0.8)',  text: 'BLOCKED',    color: '#FFD0CC' },
    approved: { bg: 'rgba(39,174,96,0.85)', text: 'APPROVED ✓', color: '#D0FFE8' },
    up:       { bg: 'rgba(23,168,140,0.85)',text: '↑ WAVE 1',   color: '#D0FFF5' },
    down:     { bg: 'rgba(192,57,43,0.8)',  text: '↓ WAVE 2',   color: '#FFD0CC' },
  }
  const b = m.badge ? badgeMap[m.badge] : null
  return (
    <div style={{
      background: m.badge === 'blocked' ? 'rgba(192,57,43,0.06)' : m.badge === 'approved' ? 'rgba(39,174,96,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${m.badge === 'blocked' ? 'rgba(192,57,43,0.3)' : m.badge === 'approved' ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 12, padding: '16px', opacity: m.dim ? 0.4 : 1,
      transition: 'all 0.5s', position: 'relative' as const,
    }}>
      {b && <div style={{ position: 'absolute', top: 8, right: 8, background: b.bg, color: b.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 3, letterSpacing: 0.8 }}>{b.text}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#1A1208', flexShrink: 0 }}>
          {m.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#F5F0E8', marginBottom: 4 }}>{m.name}</div>
          <WaveBadge wave={m.wave} />
        </div>
        <Ring score={m.score} size={62} stroke={m.color} />
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.38)', marginBottom: 5, letterSpacing: 1 }}>PRIME ⭑</div>
          <TokenDots count={m.prime} total={2} type="prime" />
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.38)', marginBottom: 5, letterSpacing: 1 }}>HOLIDAY ◆</div>
          <TokenDots count={m.holiday} total={1} type="holiday" />
        </div>
      </div>
    </div>
  )
}

/* ─── Step 0 — Meet the Circle ───────────────────────────────── */
function Step0() {
  const members: MD[] = [
    { name: 'Claire', initials: 'CL', color: BLUE,      wave: 1, score: 85, prime: 2, holiday: 1 },
    { name: 'Sarah',  initials: 'SA', color: GOLD,      wave: 1, score: 74, prime: 2, holiday: 1 },
    { name: 'James',  initials: 'JA', color: '#17A88C', wave: 2, score: 63, prime: 2, holiday: 1 },
    { name: 'Lisa',   initials: 'LI', color: '#C8A0D8', wave: 2, score: 58, prime: 2, holiday: 1 },
  ]
  return (
    <div>
      <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: 560 }}>
        Four people. One lake house. Everyone starts Season 2026 with equal token allocations.
        Waves were sorted by last year's scores — no vote, no debate. The algorithm decided.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 20 }}>
        {members.map(m => <MemberCard key={m.name} m={m} />)}
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(247,179,47,0.07)', border: '1px solid rgba(247,179,47,0.2)', borderRadius: 8, fontSize: 13, color: 'rgba(245,240,232,0.65)', lineHeight: 1.65 }}>
        <strong style={{ color: GOLD }}>Score rings</strong> show accumulated fairness — higher means less prime time taken last season.{' '}
        <strong style={{ color: '#F5F0E8' }}>Top 2 scores → Wave 1 · Bottom 2 → Wave 2.</strong>{' '}
        Each member gets <strong style={{ color: '#F5F0E8' }}>2 prime tokens</strong> and <strong style={{ color: '#F5F0E8' }}>1 holiday token</strong> — regardless of wave.
      </div>
    </div>
  )
}

/* ─── Step 1 — Wave Priority ─────────────────────────────────── */
function Step1() {
  return (
    <div>
      <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
        Booking windows open. Wave 1 gets exclusive access for 7 days. James and Lisa
        don't complain — they knew this from day one. Their turn is 6 days away.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ background: 'rgba(32,63,94,0.25)', border: '1px solid rgba(136,185,217,0.35)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <WaveBadge wave={1} />
            <span style={{ fontSize: 12, color: '#A8C8E8', fontWeight: 600 }}>Booking window: OPEN</span>
          </div>
          {[{ name: 'Claire', initials: 'CL', color: BLUE }, { name: 'Sarah', initials: 'SA', color: GOLD }].map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#1A1208' }}>{m.initials}</div>
              <span style={{ fontSize: 14, color: '#F5F0E8', flex: 1 }}>{m.name}</span>
              <span style={{ fontSize: 11, color: '#88D8C0', fontWeight: 700 }}>✓ Browsing calendar</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, opacity: 0.75 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <WaveBadge wave={2} />
            <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.35)', fontWeight: 600 }}>Opens in 6 days</span>
          </div>
          {[{ name: 'James', initials: 'JA', color: '#17A88C' }, { name: 'Lisa', initials: 'LI', color: '#C8A0D8' }].map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', opacity: 0.5 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#1A1208' }}>{m.initials}</div>
              <span style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', flex: 1 }}>{m.name}</span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.28)', fontWeight: 600 }}>🔒 Waiting</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(26,122,110,0.07)', border: '1px solid rgba(26,122,110,0.22)', borderRadius: 8, fontSize: 13, color: 'rgba(245,240,232,0.65)', lineHeight: 1.65 }}>
        No one had to tell James to wait. His calendar is locked and shows exactly when his window opens.{' '}
        <strong style={{ color: '#88D8C0' }}>The system is the conversation.</strong>
      </div>
    </div>
  )
}

/* ─── Step 2 — Prime Token Gate ──────────────────────────────── */
function Step2() {
  return (
    <div>
      <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: 14 }}>
        July Long Weekend — the most coveted prime date of the season. Claire used one token
        earlier. Lisa used both of hers. Both tap "Request Booking." The system runs in 200ms.
      </p>
      <div style={{ background: 'rgba(247,179,47,0.07)', border: '1px solid rgba(247,179,47,0.22)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: GOLD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>⭑</span><span>July 18–21 · Prime Weekend · Token Required to Book</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 20 }}>
        <MemberCard m={{ name: 'Claire', initials: 'CL', color: BLUE,      wave: 1, score: 85, prime: 1, holiday: 1, badge: 'approved' }} />
        <MemberCard m={{ name: 'Lisa',   initials: 'LI', color: '#C8A0D8', wave: 2, score: 58, prime: 0, holiday: 1, badge: 'blocked'  }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
        <div style={{ padding: '14px 16px', background: 'rgba(39,174,96,0.07)', border: '1px solid rgba(39,174,96,0.22)', borderRadius: 8, fontSize: 13, color: 'rgba(245,240,232,0.7)', lineHeight: 1.65 }}>
          <div style={{ color: '#88D8C0', fontWeight: 700, marginBottom: 6 }}>Claire ✓</div>
          Used 1 prime token earlier. 1 remaining. Request approved. Calendar blocks all others. Fairness debit queued.
        </div>
        <div style={{ padding: '14px 16px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.22)', borderRadius: 8, fontSize: 13, color: 'rgba(245,240,232,0.7)', lineHeight: 1.65 }}>
          <div style={{ color: '#F08080', fontWeight: 700, marginBottom: 6 }}>Lisa ✗</div>
          Used both prime tokens earlier. Balance: 0. RLS policy fires at the database before her request reaches the owner.
        </div>
      </div>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 13, color: 'rgba(245,240,232,0.52)', lineHeight: 1.65 }}>
        Lisa doesn't text the group chat. There's nothing to text. The app told her why.
        She used her tokens. Claire didn't.{' '}<strong style={{ color: 'rgba(245,240,232,0.78)' }}>The system decided. Not the owner.</strong>
      </div>
    </div>
  )
}

/* ─── Step 3 — Score Debit ───────────────────────────────────── */
function Step3() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => setPhase(3), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])
  const sarahScore = [74, 69, 57, 45][phase]
  const jamesScore = phase >= 3 ? 58 : 63
  const bookings = [
    { date: 'Jun 14–16', type: 'Regular', debit: '−5',  accent: 'rgba(245,240,232,0.45)', active: phase >= 1 },
    { date: 'Jul 4–7',   type: 'Prime ⭑', debit: '−12', accent: GOLD,                      active: phase >= 2 },
    { date: 'Aug 1–4',   type: 'Prime ⭑', debit: '−12', accent: GOLD,                      active: phase >= 3 },
  ]
  return (
    <div>
      <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
        Sarah books three stays — two prime weekends. Each one debits her score.
        James books once and lets his score breathe. That patience is about to pay off.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Sarah */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div><div style={{ fontWeight: 700, fontSize: 15, color: '#F5F0E8', marginBottom: 6 }}>Sarah</div><WaveBadge wave={1} /></div>
            <Ring score={sarahScore} size={72} stroke={GOLD} />
          </div>
          {bookings.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 6, marginBottom: 6,
              background: b.active ? 'rgba(247,179,47,0.07)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${b.active ? 'rgba(247,179,47,0.18)' : 'rgba(255,255,255,0.05)'}`,
              opacity: b.active ? 1 : 0.3, transition: 'all 0.6s',
            }}>
              <div>
                <div style={{ fontSize: 13, color: '#F5F0E8' }}>{b.date}</div>
                <div style={{ fontSize: 11, color: b.accent }}>{b.type}</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: '#F08080' }}>
                {b.active ? b.debit : '—'}
              </div>
            </div>
          ))}
        </div>
        {/* James */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div><div style={{ fontWeight: 700, fontSize: 15, color: '#F5F0E8', marginBottom: 6 }}>James</div><WaveBadge wave={2} /></div>
            <Ring score={jamesScore} size={72} stroke="#17A88C" />
          </div>
          <div style={{
            padding: '9px 12px', borderRadius: 6, marginBottom: 6,
            background: phase >= 3 ? 'rgba(23,168,140,0.07)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${phase >= 3 ? 'rgba(23,168,140,0.2)' : 'rgba(255,255,255,0.05)'}`,
            opacity: phase >= 3 ? 1 : 0.3, transition: 'all 0.6s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#F5F0E8' }}>Jul 28–30</div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)' }}>Regular</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: '#F08080' }}>
                {phase >= 3 ? '−5' : '—'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '12px', background: 'rgba(23,168,140,0.06)', border: '1px solid rgba(23,168,140,0.14)', borderRadius: 8, fontSize: 12, color: 'rgba(245,240,232,0.55)', lineHeight: 1.65 }}>
            One booking. One debit. James closes at 58 — thirteen points above Sarah's 45.
            Small gap. Enormous consequence at season end.
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 16px', background: 'rgba(247,179,47,0.05)', border: '1px solid rgba(247,179,47,0.12)', borderRadius: 8, fontSize: 12, color: 'rgba(245,240,232,0.5)', lineHeight: 1.6 }}>
        Prime debit weight <strong style={{ color: GOLD }}>1.5×</strong> · Holiday debit weight <strong style={{ color: BLUE }}>2.0×</strong> · Scores only fall mid-season. Recovery runs at close.
      </div>
    </div>
  )
}

/* ─── Step 4 — Season Closes ─────────────────────────────────── */
function Step4() {
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 450); return () => clearTimeout(t) }, [])
  const members = [
    { name: 'Claire', initials: 'CL', color: BLUE,      closing: 82, newScore: 82 + (100-82)*0.30 },
    { name: 'Sarah',  initials: 'SA', color: GOLD,      closing: 45, newScore: 45 + (100-45)*0.30 },
    { name: 'James',  initials: 'JA', color: '#17A88C', closing: 58, newScore: 58 + (100-58)*0.30 },
    { name: 'Lisa',   initials: 'LI', color: '#C8A0D8', closing: 55, newScore: 55 + (100-55)*0.30 },
  ]
  return (
    <div>
      <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
        Season closes. The formula runs automatically on every score. No owner decision. No vote.
        Scores never go back to 50 — your history travels into next season.
      </p>
      <div style={{ background: 'rgba(32,63,94,0.25)', border: '1px solid rgba(136,185,217,0.3)', borderRadius: 10, padding: '16px 22px', marginBottom: 24, textAlign: 'center' as const }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(13px,2.6vw,19px)', color: '#A8D4F0', letterSpacing: 0.5, marginBottom: 8 }}>
          new = closing + (100 − closing) × 0.30
        </div>
        <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.38)', letterSpacing: 0.3 }}>
          recovery_rate = 0.30 · always · locked in circle_config · never changes mid-season
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 16 }}>
        {members.map(m => (
          <div key={m.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '18px 16px', textAlign: 'center' as const }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: m.color, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#1A1208' }}>{m.initials}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#F5F0E8', marginBottom: 14 }}>{m.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: 'rgba(245,240,232,0.38)' }}>{m.closing}</div>
                <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', letterSpacing: 1, marginTop: 2 }}>CLOSING</div>
              </div>
              <div style={{ color: 'rgba(247,179,47,0.5)', fontSize: 16 }}>→</div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: show ? m.color : 'rgba(245,240,232,0.38)', transition: 'color 0.7s' }}>
                  {show ? m.newScore.toFixed(1) : m.closing}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', letterSpacing: 1, marginTop: 2 }}>NEW</div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(245,240,232,0.35)', fontFamily: "'JetBrains Mono',monospace" }}>
              +{((100 - m.closing) * 0.30).toFixed(1)} pts recovery
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 13, color: 'rgba(245,240,232,0.55)', lineHeight: 1.65 }}>
        Even at closing 45, Sarah rebounds to <strong style={{ color: GOLD }}>61.5</strong> — not 50.
        But James closes 58 and opens next season at <strong style={{ color: '#17A88C' }}>70.6</strong>.
        That gap is the cost of her prime bookings. Now watch what it means for waves.
      </div>
    </div>
  )
}

/* ─── Step 5 — The Swap ──────────────────────────────────────── */
function Step5() {
  const [reveal, setReveal] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReveal(true), 500); return () => clearTimeout(t) }, [])
  const before = [
    { name: 'Claire', color: BLUE,      score: 85,   wave: 1 as const },
    { name: 'Sarah',  color: GOLD,      score: 74,   wave: 1 as const },
    { name: 'James',  color: '#17A88C', score: 63,   wave: 2 as const },
    { name: 'Lisa',   color: '#C8A0D8', score: 58,   wave: 2 as const },
  ]
  const after = [
    { name: 'Claire', color: BLUE,      score: 87.4, wave: 1 as const, change: '' },
    { name: 'James',  color: '#17A88C', score: 70.6, wave: 1 as const, change: '↑ WAVE 1' },
    { name: 'Lisa',   color: '#C8A0D8', score: 68.5, wave: 2 as const, change: '' },
    { name: 'Sarah',  color: GOLD,      score: 61.5, wave: 2 as const, change: '↓ WAVE 2' },
  ]
  return (
    <div>
      <p style={{ color: 'rgba(245,240,232,0.65)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
        New season. Waves re-sort from the reset scores. Top 2 → Wave 1. Bottom 2 → Wave 2.
        Not a vote. Arithmetic. It ran automatically at midnight.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Season 2026 */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(245,240,232,0.3)', marginBottom: 14 }}>SEASON 2026</div>
          {before.map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.color, opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#1A1208' }}>{m.name.substring(0,2).toUpperCase()}</div>
              <span style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', flex: 1 }}>{m.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'rgba(245,240,232,0.3)', marginRight: 8 }}>{m.score}</span>
              <WaveBadge wave={m.wave} />
            </div>
          ))}
        </div>
        {/* Season 2027 */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${reveal ? 'rgba(247,179,47,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: 20, transition: 'border-color 0.8s' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: reveal ? GOLD : 'rgba(245,240,232,0.3)', marginBottom: 14, transition: 'color 0.8s' }}>SEASON 2027 — NEW ORDER</div>
          {after.map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#1A1208' }}>{m.name.substring(0,2).toUpperCase()}</div>
              <span style={{ fontSize: 14, color: '#F5F0E8', flex: 1 }}>{m.name}</span>
              {m.change && <span style={{ fontSize: 10, fontWeight: 700, color: m.change.includes('↑') ? '#88D8C0' : '#F08080', opacity: reveal ? 1 : 0, transition: 'opacity 0.8s', letterSpacing: 0.4 }}>{m.change}</span>}
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: reveal ? m.color : 'rgba(245,240,232,0.3)', marginRight: 8, transition: 'color 0.8s' }}>{reveal ? m.score.toFixed(1) : '—'}</span>
              <WaveBadge wave={m.wave} />
            </div>
          ))}
        </div>
      </div>
      {/* Swap callout */}
      <div style={{
        background: reveal ? 'rgba(247,179,47,0.07)' : 'transparent',
        border: `1px solid ${reveal ? 'rgba(247,179,47,0.28)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 12, padding: 20, transition: 'all 0.8s', opacity: reveal ? 1 : 0,
      }}>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#17A88C', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#1A1208' }}>JA</div>
            <div style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 700 }}>James</div>
            <div style={{ fontSize: 12, color: '#88D8C0', marginTop: 3 }}>Wave 2 → Wave 1</div>
          </div>
          <div style={{ fontSize: 30, color: 'rgba(247,179,47,0.45)' }}>⇄</div>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: GOLD, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: '#1A1208' }}>SA</div>
            <div style={{ fontSize: 14, color: '#F5F0E8', fontWeight: 700 }}>Sarah</div>
            <div style={{ fontSize: 12, color: '#F08080', marginTop: 3 }}>Wave 1 → Wave 2</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' as const, fontSize: 14, color: 'rgba(245,240,232,0.6)', lineHeight: 1.8 }}>
          Sarah knew this was possible when she booked those prime weekends.<br />
          James knew patience had a payoff.{' '}<strong style={{ color: '#F5F0E8' }}>Nobody had to say a word about it.</strong>
        </div>
      </div>
    </div>
  )
}

/* ─── Main App ───────────────────────────────────────────────── */
export default function FairnessDemo() {
  const [step, setStep] = useState(0)
  const storyRef = useRef<HTMLDivElement>(null)
  const storyAnchorRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([])
  const TOTAL = 6

  const scrollToStory = () => {
    const el = storyAnchorRef.current
    if (!el) return
    const headerOffset = 88
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  const steps = [
    { title: 'The Circle',    icon: '◈', content: <Step0 /> },
    { title: 'Wave Priority', icon: '⟐', content: <Step1 /> },
    { title: 'Token Gate',    icon: '⭑', content: <Step2 /> },
    { title: 'Score Debit',   icon: '↓', content: <Step3 key={`s3-${step === 3}`} /> },
    { title: 'Season Closes', icon: '⟳', content: <Step4 key={`s4-${step === 4}`} /> },
    { title: 'The Swap',      icon: '⇄', content: <Step5 key={`s5-${step === 5}`} /> },
  ]

  const goTo = (i: number) => {
    setStep(i)
  }

  useEffect(() => {
    pillRefs.current[step]?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' })
  }, [step])

  return (
    <div className="fairness-page" style={{ fontFamily: "'Overpass',sans-serif", background: '#0F0C09', color: '#F5F0E8', minHeight: '100vh' }}>

      {/* @section: hero */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/images/lake_bg_1.jpeg" alt="Dossey Lake House at dusk" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-content">
            <p className="eyebrow">Fairness Engine · Interactive Demo</p>
            <h1>
              How fairness works
              <br />
              in 60 seconds
            </h1>
            <p className="hero-lead">
              Sarah and James share Dossey Lake House with Claire and Lisa. Tokens decide who gets
              the prime dates. Scores decide who books first next year. Nobody argues — the
              algorithm is the agreement.
            </p>
            <div className="signup-form--hero">
              <button
                type="button"
                className="btn btn-gold"
                onClick={scrollToStory}
              >
                See It Happen →
              </button>
              <p className="signup-note">Six steps. One family. Zero arguments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* @section: story */}
      <div id="fairness-story" ref={storyRef} className="fairness-story">

        <div ref={storyAnchorRef} className="fairness-story-anchor" aria-hidden="true" />

        {/* Step pills — swipe sideways on narrow screens */}
        <div className="fair-step-pills" aria-label="Jump to step">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              ref={(el) => { pillRefs.current[i] = el }}
              onClick={() => goTo(i)}
              className={`fair-step-pill${step === i ? ' is-active' : ''}`}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* Step header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.32)', letterSpacing: 3, marginBottom: 8 }}>
            STEP {step + 1} OF {TOTAL}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,5vw,42px)', fontWeight: 600, margin: 0, color: '#F5F0E8', lineHeight: 1.15 }}>
            {steps[step].title}
          </h2>
        </div>

        {/* Content */}
        <div style={{ minHeight: 380 }}>{steps[step].content}</div>

        {/* Prev / dots / Next */}
        <div className="fairness-nav">
          <button
            type="button"
            onClick={() => step > 0 && goTo(step - 1)}
            className={`fairness-nav-btn${step > 0 ? '' : ' is-hidden'}`}
          >
            ← Previous
          </button>
          <div className="fairness-nav-dots" aria-label="Step progress">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to step ${i + 1}`}
                onClick={() => goTo(i)}
                className={`fairness-nav-dot${i === step ? ' is-active' : ''}`}
              />
            ))}
          </div>
          {step < TOTAL - 1 ? (
            <button type="button" onClick={() => goTo(step + 1)} className="fairness-nav-btn is-primary">
              Next →
            </button>
          ) : (
            <button type="button" onClick={() => goTo(0)} className="fairness-nav-btn is-gold">
              Start Over ↺
            </button>
          )}
        </div>
      </div>

      {/* @section: formula */}
      <div style={{ borderTop: '1px solid rgba(136,185,217,0.13)', borderBottom: '1px solid rgba(136,185,217,0.13)', padding: '64px 24px', background: 'rgba(32,63,94,0.14)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' as const }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, letterSpacing: 4, color: GOLD, marginBottom: 18 }}>THE SCORE PROMISE</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: 600, margin: '0 0 24px', color: '#F5F0E8', lineHeight: 1.2 }}>
            Your score travels with you.<br />It never resets to 50.
          </h2>
          <div style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(136,185,217,0.22)', borderRadius: 10, padding: '18px 28px', marginBottom: 22, display: 'inline-block' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 'clamp(13px,2.5vw,19px)', color: '#A8D4F0', letterSpacing: 0.5 }}>
              new = closing + (100 − closing) × 0.30
            </div>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.36)', marginTop: 8 }}>
              recovery_rate = 0.30 · always · locked in circle_config
            </div>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.56)', lineHeight: 1.78, margin: '0 auto', maxWidth: 540 }}>
            A member who took every prime date still carries that history next year.
            They recover — but they don't leap past someone who showed restraint.
            That's the accountability loop. It works without a single group chat message.
          </p>
        </div>
      </div>

      {/* @section: cta */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="/images/lake_bg_8.jpeg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,9,0.78)' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', padding: '80px 24px 90px', textAlign: 'center' as const }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, letterSpacing: 4, color: GOLD, marginBottom: 20 }}>◈ VALHAVERLY</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,5vw,50px)', fontWeight: 600, margin: '0 0 20px', color: '#F5F0E8', lineHeight: 1.2 }}>
            Run your property this way.<br />No group chat needed.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.55)', lineHeight: 1.78, marginBottom: 38 }}>
            Valhaverly gives your lake house, chalet, or boat a fairness engine.<br />
            Bookings, scores, tokens, and trust — all in one quiet system.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <a href="/early-access" style={{ background: GOLD, color: '#1A1208', border: 'none', borderRadius: 6, padding: '14px 34px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Overpass',sans-serif", textDecoration: 'none', display: 'inline-block' }}>
              Join the Waitlist →
            </a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ background: 'transparent', color: 'rgba(245,240,232,0.62)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, padding: '14px 34px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Overpass',sans-serif" }}>
              Watch Again ↑
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
