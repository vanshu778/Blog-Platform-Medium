import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="flex-1 border-b border-ink bg-[#f7f4ed] relative overflow-hidden">
        <div className="max-w-[1192px] mx-auto px-6 flex items-center min-h-[calc(100vh-64px-80px)]">
          {/* Left: Text Content */}
          <div className="flex-1 py-16 md:py-24 z-10">
            <h1 className="font-serif text-[clamp(50px,7.5vw,106px)] font-normal text-ink leading-[1.05] tracking-[-0.02em] mb-8">
              Human<br />
              stories & ideas
            </h1>
            <p className="text-xl md:text-[22px] text-ink-light leading-relaxed mb-10 max-w-lg">
              A place to read, write, and deepen your understanding
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-ink text-cream text-xl font-medium px-12 py-3 rounded-full hover:bg-ink-light transition-colors"
            >
              Start reading
            </Link>
          </div>

          {/* Right: Decorative Illustration */}
          <div className="hidden md:flex flex-1 justify-end items-center relative">
            <div className="relative w-[460px] h-[460px]">
              {/* Green blob background */}
              <div className="absolute inset-0">
                <svg viewBox="0 0 460 460" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Main green shape */}
                  <path
                    d="M230 20 C310 20, 400 80, 420 170 C440 260, 400 360, 320 410 C240 460, 140 440, 80 370 C20 300, 10 200, 60 120 C110 40, 170 20, 230 20Z"
                    fill="#1a8917"
                  />
                  {/* Flower/clover shape */}
                  <g transform="translate(170, 50)">
                    <circle cx="60" cy="30" r="45" fill="#156912" />
                    <circle cx="100" cy="60" r="45" fill="#1a8917" />
                    <circle cx="85" cy="105" r="45" fill="#156912" />
                    <circle cx="35" cy="105" r="45" fill="#1a8917" />
                    <circle cx="20" cy="60" r="45" fill="#156912" />
                    <circle cx="60" cy="70" r="20" fill="#f7f4ed" />
                  </g>
                  {/* Dashed arc decorations */}
                  <circle cx="340" cy="200" r="120" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.4" />
                  <circle cx="340" cy="200" r="160" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4 10" opacity="0.25" />
                  {/* Hand pointing shape */}
                  <g transform="translate(200, 270)">
                    <rect x="40" y="20" width="140" height="100" rx="10" fill="#f7f4ed" />
                    <rect x="80" y="0" width="12" height="40" rx="6" fill="#f7f4ed" transform="rotate(-20 86 20)" />
                    <rect x="100" y="-5" width="12" height="45" rx="6" fill="#f7f4ed" transform="rotate(-5 106 17)" />
                    <rect x="120" y="0" width="12" height="40" rx="6" fill="#f7f4ed" transform="rotate(10 126 20)" />
                  </g>
                  {/* Sparkle dots */}
                  <circle cx="380" cy="100" r="3" fill="#1a1a1a" opacity="0.5" />
                  <circle cx="400" cy="320" r="2.5" fill="#1a1a1a" opacity="0.4" />
                  <circle cx="350" cy="380" r="3" fill="#f7f4ed" />
                  <circle cx="120" cy="350" r="2" fill="#f7f4ed" />
                  {/* Star/sparkle */}
                  <g transform="translate(370, 340)" fill="#f7f4ed">
                    <rect x="-1" y="-8" width="2" height="16" rx="1" />
                    <rect x="-8" y="-1" width="16" height="2" rx="1" />
                    <rect x="-5" y="-5" width="2" height="10" rx="1" transform="rotate(45)" />
                    <rect x="-5" y="-5" width="10" height="2" rx="1" transform="rotate(45)" />
                  </g>
                  <g transform="translate(280, 400)" fill="#f7f4ed">
                    <rect x="-1" y="-6" width="2" height="12" rx="1" />
                    <rect x="-6" y="-1" width="12" height="2" rx="1" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-[#f7f4ed] border-t border-border py-6">
        <div className="max-w-[1192px] mx-auto px-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          <span className="hover:text-ink cursor-pointer transition-colors">Help</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Status</span>
          <span className="hover:text-ink cursor-pointer transition-colors">About</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Careers</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Press</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Blog</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-ink cursor-pointer transition-colors">Text to speech</span>
        </div>
      </footer>
    </div>
  )
}
