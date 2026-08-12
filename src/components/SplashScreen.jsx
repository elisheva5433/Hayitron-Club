import { useState, useEffect, useCallback } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('arrive'); // arrive -> idle -> exit

  const dismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(onDone, 700);
  }, [onDone]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('idle'), 1400);
    const t2 = setTimeout(dismiss, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [dismiss]);

  return (
    <div className={`splash-overlay ${phase === 'exit' ? 'splash-exit' : ''}`} onClick={dismiss}>
      {/* radial spotlight */}
      <div className="splash-spotlight" />

      {/* logo top */}
      <div className="splash-logo">
        <img src="/לוגו הלב היהודי-02.png" alt="הלב היהודי" style={{ height: '44px', objectFit: 'contain', filter: 'brightness(2)' }} />
      </div>

      {/* stage + card */}
      <div className="splash-stage-wrap">
        {/* tiered platform rings */}
        <div className="splash-platform">
          <div className="splash-ring splash-ring-3" />
          <div className="splash-ring splash-ring-2" />
          <div className="splash-ring splash-ring-1" />
          <div className="splash-ring-glow" />
        </div>

        {/* the card */}
        <div className={`splash-card-wrap ${phase === 'idle' || phase === 'exit' ? 'splash-card-spin' : 'splash-card-arrive'}`}>
          <div className="splash-card">
            {/* card shine layer */}
            <div className="splash-card-shine" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <img
                src="/לוגו הלב היהודי-02.png"
                alt=""
                style={{ height: '22px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'brightness(2.5)' }}
              />
              <div className="splash-chip">
                <div className="splash-chip-inner" />
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: '1.45rem', letterSpacing: '0.03em', marginBottom: '0.12rem' }}>
                בית נאמן
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.04em', marginBottom: '0.55rem' }}>
                כל ההטבות בבית אחד.
              </div>
              <div style={{ fontFamily: "'Rubik', sans-serif", fontSize: '0.95rem', letterSpacing: '0.16em', opacity: 0.85, marginBottom: '0.5rem' }}>
                4291 8830 1122 4457
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.55, marginBottom: '0.1rem' }}>בעל הכרטיס</div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', opacity: 0.9 }}>חבר · פרימיום</div>
                </div>
                <div style={{ fontSize: '0.65rem', opacity: 0.55 }}>08/29</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* slogan below stage */}
      <div className="splash-slogan">
        <p>עם אחד. לב אחד. אין סוף אפשרויות.</p>
      </div>

      <button className="splash-skip" onClick={dismiss}>דלג</button>
    </div>
  );
}
