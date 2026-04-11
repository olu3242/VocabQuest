import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './landing-page.css';

const FAQ_ITEMS = [
  {
    q: 'What grades is VocaQuest designed for?',
    a: 'VocaQuest supports all K-12 students through four grade-band worlds: Word Garden (K-2), Sentence City (3-5), Expression Academy (6-8), and Fluency Arena (9-12). Each world has age-appropriate vocabulary, challenge difficulty, and visual design.',
  },
  {
    q: 'Is VocaQuest COPPA and FERPA compliant?',
    a: 'Yes. VocaQuest is built with student safety as a core requirement. We require parental consent for students under 13, do not include open-ended student-to-student chat, store no unnecessary PII, and our school plans include a standard Data Processing Agreement (DPA).',
  },
  {
    q: 'How does pronunciation scoring work?',
    a: 'In the current version, we use the Web Speech API to capture student recordings and score clarity and word recognition. Our Phase 6 roadmap includes Whisper-based AI pronunciation scoring with detailed syllable-level feedback powered by the Anthropic API.',
  },
  {
    q: 'Can teachers align VocaQuest to their curriculum?',
    a: 'Yes. Teachers can assign custom word sets from the library, create their own word groups tied to a reading unit or novel, and set assignment windows with due dates. The word library includes filtering by grade band, part of speech, difficulty, and vocabulary category.',
  },
  {
    q: 'What is the "Say It Better" challenge?',
    a: `Students are shown common weak or vague phrases (like "The book was good" or "I'm mad") and challenged to upgrade them using stronger vocabulary. AI scores the upgrade on vocabulary strength, tone maturity, and clarity. It's one of the most popular features for building academic language.`,
  },
  {
    q: 'What devices does VocaQuest support?',
    a: 'VocaQuest works on any modern browser on desktop, tablet, and mobile — including Chromebooks (heavily used in K-12). A React Native mobile app for iOS and Android is on our roadmap for Phase 2.',
  },
  {
    q: 'How much does VocaQuest cost for a school?',
    a: 'School plans start at $2,499/year for up to 500 students and include admin dashboard, SSO (via Clever/ClassLink), district reporting, and professional development sessions. Contact us for custom district pricing and Title I school pricing.',
  },
];

const MECHANICS = [
  { icon: '⚡', title: 'XP System', desc: 'Every action earns XP — learning, speaking, building sentences, and completing quests. XP drives levels, unlocks rewards, and tracks real growth.', chip: '+10 to +150 XP per action', chipClass: 'amber' },
  { icon: '📈', title: '8 Levels to Master', desc: 'Word Explorer → Sentence Builder → Clarity Speaker → Vocabulary Ninja → Expression Master → Academic Communicator → Fluent Leader → Elite Orator.', chip: 'Level up to unlock', chipClass: '' },
  { icon: '🔥', title: 'Streak Engine', desc: 'Daily streaks, speaking streaks, and weekly consistency badges. Streak shields let students miss one day without losing their chain.', chip: 'Streak Shields available', chipClass: 'teal' },
  { icon: '🏅', title: 'Badge Cabinet', desc: '30+ earnable badges including Boss Battle Winner, 7-Day Streak, Academic Word Hero, and Elite Orator. Each badge unlocks a celebration.', chip: '30+ badges to collect', chipClass: 'amber' },
  { icon: '⚔️', title: 'Weekly Boss Battles', desc: 'Every Monday a timed multi-round language challenge drops. Students compete for XP bonuses, exclusive badges, and leaderboard glory. Closes Sunday.', chip: '150 XP to win', chipClass: '' },
  { icon: '🏆', title: 'Leaderboards', desc: 'Class leaderboards, weekly rankings, and friend squads — with privacy controls. Teachers can customize visibility and celebrate top performers safely.', chip: 'Class + Weekly + Global', chipClass: 'teal' },
];

const WORLDS = [
  { cls: 'wg', icon: '🌱', name: 'Word Garden',        grades: 'Grades K–2',  desc: 'Foundational vocabulary, phonics, and basic articulation. Grow your first 200 words in a safe, encouraging environment.',              badge: '200 Seed Words'   },
  { cls: 'sc', icon: '🏙️', name: 'Sentence City',      grades: 'Grades 3–5',  desc: 'Sentence construction, context mastery, and expression. Build language that connects to the real world around you.',                  badge: '350 City Words'   },
  { cls: 'ea', icon: '🎓', name: 'Expression Academy', grades: 'Grades 6–8',  desc: 'Vocabulary depth, nuance, and speaking clarity. Learn to express complex ideas with precision and confidence.',                       badge: '500 Academy Words' },
  { cls: 'fa', icon: '🏆', name: 'Fluency Arena',      grades: 'Grades 9–12', desc: 'Academic vocabulary, persuasion, and oratory confidence. Compete for language mastery at the highest level.',                          badge: '750 Elite Words'  },
];

const TESTIMONIALS = [
  { text: `"My 4th grader has never been excited about vocabulary before. She asked ME to let her do her 'word quest' before dinner. That's never happened."`, name: 'Keisha M.',  role: 'Parent of 4th grader, Atlanta GA',         avatar: '👩'    },
  { text: `"As a reading specialist, I've tried dozens of tools. VocaQuest is the first one where I can actually see pronunciation improvement trends over time. The data is real."`, name: 'James T.',  role: 'K-8 Reading Specialist, Chicago IL',       avatar: '👨‍🏫' },
  { text: `"My ELL students needed something that made them feel safe practicing speaking. The pronunciation feedback is encouraging, not harsh — and they keep coming back."`, name: 'Ms. Patel', role: '6th Grade ELA Teacher, Houston TX',          avatar: '👩‍🏫' },
];

const LEADERBOARD = [
  { rank: '🥇', rankCls: 'gold',   avatar: '👧', name: 'Amara J.',  meta: 'Level 5 · 12 day streak 🔥', xp: '+840 XP' },
  { rank: '🥈', rankCls: 'silver', avatar: '👦', name: 'Marcus T.', meta: 'Level 4 · 8 day streak 🔥',  xp: '+720 XP' },
  { rank: '🥉', rankCls: 'bronze', avatar: '🧑', name: 'Priya K.',  meta: 'Level 4 · 5 day streak',     xp: '+640 XP' },
  { rank: '4',  rankCls: '',       avatar: '👩', name: 'Eli R.',    meta: 'Level 3 · 3 day streak',     xp: '+510 XP' },
  { rank: '5',  rankCls: '',       avatar: '🧒', name: 'Sofia M.',  meta: 'Level 3 · 2 day streak',     xp: '+430 XP' },
];

const MIC_BARS = [
  { d: '0.6s', h: '40%' }, { d: '0.9s', h: '70%' }, { d: '0.5s', h: '90%' },
  { d: '0.7s', h: '60%' }, { d: '1.1s', h: '80%' }, { d: '0.8s', h: '50%' },
  { d: '0.6s', h: '75%' }, { d: '0.9s', h: '45%' },
];

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [xpWidth, setXpWidth] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = 'VocaQuest — Level Up Your Language';
    const upsertMeta = (selector: string, attrs: Record<string, string>) => {
      let node = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!node) { node = document.createElement('meta'); document.head.appendChild(node); }
      Object.entries(attrs).forEach(([k, v]) => node?.setAttribute(k, v));
    };
    upsertMeta('meta[name="description"]', { name: 'description', content: 'VocaQuest turns vocabulary and articulation into a game K-12 students actually want to play. XP, streaks, boss battles, and real speaking confidence — every day.' });
    return () => { document.title = 'VocaQuest'; };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setXpWidth(62), 600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const el = statsRef.current;
    let intervalId: number | undefined;
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        intervalId = window.setInterval(() => {
          setStudentsCount((prev) => {
            const next = prev + 400;
            if (next >= 12000) { window.clearInterval(intervalId); return 12000; }
            return next;
          });
        }, 20);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); if (intervalId) window.clearInterval(intervalId); };
  }, []);

  const studentCountLabel = useMemo(() => `${studentsCount.toLocaleString()}+`, [studentsCount]);

  return (
    <div className="vq-landing">

      {/* NAV */}
      <header className={`vq-nav${navSolid ? ' vq-nav-solid' : ''}`}>
        <Link to="/" className="vq-nav-logo">VocaQuest</Link>
        <nav className="vq-nav-links">
          <a href="#how">How It Works</a>
          <a href="#worlds">Worlds</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <Link to="/signup" className="vq-nav-cta">Start Free →</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="vq-hero">
        <div className="vq-hero-bg">
          <div className="vq-hero-orb vq-hero-orb-1" />
          <div className="vq-hero-orb vq-hero-orb-2" />
          <div className="vq-hero-orb vq-hero-orb-3" />
        </div>
        <div className="vq-container vq-hero-content">
          <div>
            <div className="vq-hero-tag fade-up"><span className="dot" /> Gamification-First K-12 Language Platform</div>
            <h1 className="vq-hero-headline fade-up">
              Level Up Your <span className="vq-accent">Language.</span><br />Earn. Speak. Win.
            </h1>
            <p className="vq-hero-sub fade-up">
              VocaQuest turns vocabulary and articulation into a game students actually want to play. XP, streaks, boss battles, and real speaking confidence — every day.
            </p>
            <div className="vq-hero-btns fade-up">
              <Link to="/signup" className="vq-btn-primary">🚀 Start Free Today</Link>
              <a href="#how" className="vq-btn-secondary">See How It Works</a>
            </div>
            <div className="vq-hero-social fade-up">
              <div className="vq-hero-avatars"><span>👦</span><span>👧</span><span>🧑</span><span>👩</span></div>
              <span>Join 12,000+ students already leveling up</span>
            </div>
          </div>

          <div className="vq-hero-preview float">
            <div className="vq-preview-card vq-accent-indigo">
              <div className="pc-label">Current Level</div>
              <div className="pc-value">Lvl 4</div>
              <div className="pc-sub">Vocabulary Ninja</div>
              <div className="vq-xp-wrap">
                <div className="vq-xp-top"><span>1,240 XP</span><span>2,000 XP</span></div>
                <div className="vq-xp-track"><div className="vq-xp-fill" style={{ width: `${xpWidth}%` }} /></div>
              </div>
            </div>
            <div className="vq-preview-card vq-accent-amber">
              <div className="pc-label">Current Streak</div>
              <div className="vq-streak"><span className="vq-flame">🔥</span>14</div>
              <div className="pc-sub">days in a row!</div>
            </div>
            <div className="vq-preview-card vq-accent-teal vq-large">
              <div className="pc-label">Today's Quest Words</div>
              <div className="vq-word-preview">
                <div className="vq-word-item"><span className="vq-word-name">Resilient</span><span className="vq-word-check">✓</span><span className="vq-word-xp">+25 XP</span></div>
                <div className="vq-word-item"><span className="vq-word-name">Articulate</span><span className="vq-word-check">✓</span><span className="vq-word-xp">+30 XP</span></div>
                <div className="vq-word-item"><span className="vq-word-name">Persevere</span><span style={{ color: '#6366F1', fontSize: '13px' }}>▶ Now</span><span className="vq-word-xp">+25 XP</span></div>
              </div>
            </div>
            <div className="vq-preview-card">
              <div className="pc-label">Recent Badges</div>
              <div className="vq-pc-badges">
                <div className="vq-pc-badge">🏆 Boss Winner</div>
                <div className="vq-pc-badge">🔥 Streak 14</div>
                <div className="vq-pc-badge">⚡ Speed Run</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div ref={statsRef} className="vq-stats">
        <div className="vq-container vq-stats-grid">
          <div className="vq-stat-item"><h3>{studentCountLabel}</h3><p>Active Students</p></div>
          <div className="vq-stat-item"><h3>500+</h3><p>Vocabulary Words</p></div>
          <div className="vq-stat-item"><h3>94%</h3><p>Parent Satisfaction</p></div>
          <div className="vq-stat-item"><h3>4 Worlds</h3><p>K-12 Grade Bands</p></div>
        </div>
      </div>

      {/* CORE PRODUCT LOOP */}
      <section className="vq-section vq-bg-light">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag">Core Product Loop</div>
            <h2 className="vq-section-title">Every Word. Every Day. Every Win.</h2>
            <p className="vq-section-sub vq-centered-text">A repeating loop designed to build real language mastery — not just test prep.</p>
          </div>
          <div className="vq-loop-steps">
            <div className="vq-loop-step"><div className="vq-step-num">1</div><div className="vq-step-icon">📖</div><div className="vq-step-title">Learn</div><div className="vq-step-desc">Discover new words with phonetics, definitions, and context</div></div>
            <div className="vq-loop-arrow">→</div>
            <div className="vq-loop-step"><div className="vq-step-num">2</div><div className="vq-step-icon">🎤</div><div className="vq-step-title">Speak</div><div className="vq-step-desc">Record yourself pronouncing each word and get instant feedback</div></div>
            <div className="vq-loop-arrow">→</div>
            <div className="vq-loop-step"><div className="vq-step-num">3</div><div className="vq-step-icon">✍️</div><div className="vq-step-title">Use It</div><div className="vq-step-desc">Build sentences and upgrade weak language into stronger expression</div></div>
            <div className="vq-loop-arrow">→</div>
            <div className="vq-loop-step"><div className="vq-step-num">4</div><div className="vq-step-icon">⚡</div><div className="vq-step-title">Earn</div><div className="vq-step-desc">Collect XP, maintain streaks, unlock badges and level rewards</div></div>
            <div className="vq-loop-arrow">→</div>
            <div className="vq-loop-step"><div className="vq-step-num">5</div><div className="vq-step-icon">🔓</div><div className="vq-step-title">Unlock</div><div className="vq-step-desc">Advance to new worlds, unlock avatars, and dominate the leaderboard</div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="vq-section" id="how">
        <div className="vq-container">
          <div className="vq-section-tag">How It Works</div>
          <h2 className="vq-section-title">Simple for Students.<br />Powerful for Teachers.</h2>
          <div className="vq-how-grid">
            <div className="vq-how-steps">
              <div className="vq-how-step"><div className="vq-how-step-num">1</div><div><h3>Pick Up a Daily Quest</h3><p>Every morning, 3-5 words arrive in the student's quest queue — curated by grade band and learning history. The quest takes 10-15 minutes.</p></div></div>
              <div className="vq-how-step"><div className="vq-how-step-num">2</div><div><h3>Learn → Hear → Say It</h3><p>Students learn each word, hear it pronounced, then record themselves saying it. AI scores clarity, syllable stress, and confidence.</p></div></div>
              <div className="vq-how-step"><div className="vq-how-step-num">3</div><div><h3>Use It in Context</h3><p>Students build a sentence using the word and complete "Say It Better" — upgrading weak phrases into stronger expressions.</p></div></div>
              <div className="vq-how-step"><div className="vq-how-step-num">4</div><div><h3>Earn &amp; Progress</h3><p>Every step earns XP. Complete the full quest for a bonus. Streak milestones, badge unlocks, and leaderboard positions update in real time.</p></div></div>
            </div>
            <div className="vq-how-visual">
              <div className="vq-hw-word-card">
                <div className="vq-hw-word">Resilient</div>
                <div className="vq-hw-phonetic">/rɪˈzɪl.i.ənt/</div>
                <div className="vq-hw-def">Able to recover quickly from difficult situations and keep going despite challenges.</div>
                <div className="vq-hw-tags"><span className="vq-hw-tag vq-hw-tag-1">Adjective</span><span className="vq-hw-tag vq-hw-tag-2">Expression Academy</span></div>
              </div>
              <div className="vq-hw-mic">
                <div className="vq-mic-icon">🎤</div>
                <div className="vq-mic-wave">
                  {MIC_BARS.map((b, i) => (
                    <div key={i} className="vq-mic-bar" style={{ '--d': b.d, height: b.h } as React.CSSProperties} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Recording…</span>
              </div>
              <div className="vq-hw-score">
                <div><div className="vq-score-label">Pronunciation Score</div><div className="vq-score-value">88%</div></div>
                <div className="vq-score-xp">+15 XP Earned!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GAME MECHANICS */}
      <section className="vq-section vq-mechanics-bg" id="mechanics">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag vq-tag-dark">Game Mechanics</div>
            <h2 className="vq-section-title" style={{ color: '#fff' }}>Built to Keep Students Coming Back</h2>
            <p className="vq-section-sub vq-centered-text" style={{ color: 'rgba(255,255,255,0.55)' }}>Every mechanic is designed to build a language habit — not just a homework habit.</p>
          </div>
          <div className="vq-mechanics-grid">
            {MECHANICS.map((m) => (
              <div key={m.title} className="vq-mech-card">
                <div className="vq-mech-icon">{m.icon}</div>
                <div className="vq-mech-title">{m.title}</div>
                <div className="vq-mech-desc">{m.desc}</div>
                <span className={`vq-mech-chip${m.chipClass ? ` ${m.chipClass}` : ''}`}>{m.chip}</span>
              </div>
            ))}
          </div>
          <div className="vq-lb-wrap">
            <div className="vq-lb-preview">
              <div className="vq-lb-header"><h3>🏆 Class Leaderboard — This Week</h3><span>Resets Monday</span></div>
              {LEADERBOARD.map((row) => (
                <div key={row.name} className="vq-lb-row">
                  <div className={`vq-lb-rank${row.rankCls ? ` ${row.rankCls}` : ''}`}>{row.rank}</div>
                  <div className="vq-lb-avatar">{row.avatar}</div>
                  <div className="vq-lb-info"><div className="vq-lb-name">{row.name}</div><div className="vq-lb-meta">{row.meta}</div></div>
                  <div className="vq-lb-xp">{row.xp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORLDS */}
      <section className="vq-section" id="worlds">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag">Grade Band Worlds</div>
            <h2 className="vq-section-title">One Platform. Four Worlds.</h2>
            <p className="vq-section-sub vq-centered-text">Age-appropriate curriculum environments with unique themes, words, and challenge levels — for every K-12 student.</p>
          </div>
          <div className="vq-worlds-grid">
            {WORLDS.map((w) => (
              <div key={w.name} className={`vq-world-card ${w.cls}`}>
                <div className="vq-world-icon">{w.icon}</div>
                <div className="vq-world-name">{w.name}</div>
                <div className="vq-world-grades">{w.grades}</div>
                <div className="vq-world-desc">{w.desc}</div>
                <span className="vq-world-badge">{w.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="vq-section vq-bg-light">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag">For Parents &amp; Teachers</div>
            <h2 className="vq-section-title">Built to Earn Trust at Every Level</h2>
            <p className="vq-section-sub vq-centered-text">Real data, actionable insights, and tools designed for busy parents and teachers.</p>
          </div>
          <div className="vq-trust-grid">
            <div className="vq-trust-card">
              <h3>👩‍👧 For Parents</h3>
              <div className="vq-tc-role">Weekly progress · Home practice tools · Safe by design</div>
              <ul className="vq-trust-list">
                <li><span className="vq-check">✓</span>Weekly report card: words mastered, pronunciation improvement, streak health</li>
                <li><span className="vq-check">✓</span>Home practice prompts tied to what your child learned this week</li>
                <li><span className="vq-check">✓</span>Confidence trend chart — track growth over 30, 60, 90 days</li>
                <li><span className="vq-check">✓</span>No open-ended social chat — full COPPA compliance</li>
                <li><span className="vq-check">✓</span>Parental controls: set daily time limits, disable features</li>
                <li><span className="vq-check">✓</span>One dashboard for multiple children at different grade levels</li>
              </ul>
            </div>
            <div className="vq-trust-card">
              <h3>👩‍🏫 For Teachers</h3>
              <div className="vq-tc-role">Classroom tools · Assignment engine · Actionable data</div>
              <ul className="vq-trust-list">
                <li><span className="vq-check">✓</span>Assign word sets aligned to your curriculum or reading unit</li>
                <li><span className="vq-check">✓</span>Identify at-risk students before they fall behind</li>
                <li><span className="vq-check">✓</span>Pronunciation accuracy trend per student and class average</li>
                <li><span className="vq-check">✓</span>Vocabulary mastery distribution — see who's thriving and who needs support</li>
                <li><span className="vq-check">✓</span>Weekly class challenge builder — one click to engage the whole class</li>
                <li><span className="vq-check">✓</span>Export reports and mission completion data to share with parents</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="vq-section vq-pricing-section" id="pricing">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag">Pricing</div>
            <h2 className="vq-section-title">Simple, Transparent Pricing</h2>
            <p className="vq-section-sub vq-centered-text">Free forever for one student. Upgrade to unlock the full VocaQuest experience.</p>
          </div>
          <div className="vq-pricing-grid">
            <div className="vq-price-card">
              <div className="vq-price-name">Free</div>
              <div className="vq-price-amount"><sup>$</sup>0</div>
              <div className="vq-price-period">forever · 1 student</div>
              <ul className="vq-price-features">
                <li>5 words per day</li><li>Basic Daily Quest</li><li>Pronunciation Challenge</li><li>Student dashboard</li><li>Word Garden + Sentence City</li>
              </ul>
              <Link to="/signup" className="vq-price-cta vq-price-cta-outline">Start Free</Link>
            </div>
            <div className="vq-price-card vq-featured">
              <div className="vq-price-badge">⭐ Most Popular</div>
              <div className="vq-price-name">Family</div>
              <div className="vq-price-amount"><sup>$</sup>9<span style={{ fontSize: '24px' }}>.99</span></div>
              <div className="vq-price-period">per month · up to 3 students</div>
              <ul className="vq-price-features">
                <li>Unlimited words daily</li><li>All 4 Grade Worlds</li><li>Weekly Boss Battles</li><li>Parent dashboard + reports</li><li>Home practice prompts</li><li>Full badge cabinet</li>
              </ul>
              <Link to="/signup" className="vq-price-cta vq-price-cta-primary">Start Family Plan</Link>
            </div>
            <div className="vq-price-card">
              <div className="vq-price-name">Teacher</div>
              <div className="vq-price-amount"><sup>$</sup>19<span style={{ fontSize: '24px' }}>.99</span></div>
              <div className="vq-price-period">per month · 1 teacher + 35 students</div>
              <ul className="vq-price-features">
                <li>Full classroom management</li><li>Mission assignment engine</li><li>Student performance tracking</li><li>Class leaderboard controls</li><li>Weekly reports + export</li><li>Challenge builder</li>
              </ul>
              <Link to="/signup" className="vq-price-cta vq-price-cta-outline">Start Teacher Plan</Link>
            </div>
          </div>
          <div className="vq-pricing-note">🏫 School or District plan? <a href="#">Contact us for custom pricing →</a></div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="vq-section vq-bg-white">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag">Early Feedback</div>
            <h2 className="vq-section-title">What Teachers &amp; Parents Are Saying</h2>
          </div>
          <div className="vq-testi-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="vq-testi-card">
                <div className="vq-testi-stars">★★★★★</div>
                <div className="vq-testi-text">{t.text}</div>
                <div className="vq-testi-author">
                  <div className="vq-testi-avatar">{t.avatar}</div>
                  <div><div className="vq-testi-name">{t.name}</div><div className="vq-testi-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="vq-section vq-faq-section" id="faq">
        <div className="vq-container">
          <div className="vq-centered">
            <div className="vq-section-tag">FAQ</div>
            <h2 className="vq-section-title">Frequently Asked Questions</h2>
          </div>
          <div className="vq-faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const open = openFaqIndex === index;
              return (
                <div key={item.q} className={`vq-faq-item${open ? ' open' : ''}`}>
                  <button type="button" className="vq-faq-q" onClick={() => setOpenFaqIndex(open ? null : index)}>
                    <span>{item.q}</span>
                    <span className="vq-faq-icon">+</span>
                  </button>
                  <div className="vq-faq-a">{item.a}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vq-cta">
        <div className="vq-hero-bg">
          <div className="vq-hero-orb" style={{ width: '400px', height: '400px', background: '#4F46E5', top: '-50px', left: '50%', transform: 'translateX(-50%)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2>Ready to Level Up?</h2>
          <p>Join thousands of students already earning XP, maintaining streaks, and speaking with confidence — every single day.</p>
          <div className="vq-cta-btns">
            <Link to="/signup" className="vq-btn-primary">🚀 Start Free Today</Link>
            <a href="#" className="vq-btn-secondary">Book a School Demo</a>
          </div>
          <div className="vq-cta-note">Free plan available · No credit card required · COPPA + FERPA safe</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="vq-footer">
        <div className="vq-footer-grid vq-container">
          <div className="vq-footer-brand">
            <Link to="/" className="vq-footer-logo">VocaQuest</Link>
            <p>Gamified K-12 vocabulary, articulation, and speaking confidence. Built for students who want to win — not just study.</p>
          </div>
          <div className="vq-footer-col"><h4>Product</h4><a href="#">Features</a><a href="#">How It Works</a><a href="#pricing">Pricing</a><a href="#worlds">Grade Worlds</a></div>
          <div className="vq-footer-col"><h4>For Schools</h4><a href="#">Teacher Plans</a><a href="#">School Licenses</a><a href="#">District Plans</a><a href="#">Request Demo</a></div>
          <div className="vq-footer-col"><h4>Company</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
        </div>
        <div className="vq-footer-bottom vq-container">
          <div>© 2026 VocaQuest. All rights reserved.</div>
          <div className="vq-footer-badges">
            <span className="vq-footer-badge">COPPA Safe</span>
            <span className="vq-footer-badge">FERPA Ready</span>
            <span className="vq-footer-badge">K-12 Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
