const TRENDING = [
  { topic: 'Self-Driving Cars Are Coming', label: 'Technology' },
  { topic: 'The Future of Remote Work', label: 'Culture' },
  { topic: 'Why Designers Should Code', label: 'Design' },
  { topic: 'Fusion Energy Breakthrough', label: 'Science' },
  { topic: 'Writing Better First Drafts', label: 'Writing' },
]

const DISCOVER_TAGS = [
  'Technology',
  'Design',
  'Science',
  'Culture',
  'Writing',
  'Business',
  'Health',
  'Programming',
  'Data Science',
  'Productivity',
  'Startup',
  'UX',
]

const FOOTER_LINKS = [
  'Help',
  'Status',
  'Writers',
  'Blog',
  'Privacy',
  'Terms',
  'About',
]

export default function Sidebar() {
  return (
    <aside className="w-[300px] font-sans sticky top-[88px] self-start hidden lg:block">
      {/* Trending Topics */}
      <section className="mb-8">
        <h3 className="font-serif text-lg font-semibold text-ink mb-4">
          Trending on Medium
        </h3>
        <ol className="list-none p-0 m-0 flex flex-col gap-1.5">
          {TRENDING.map((item, i) => (
            <li
              key={item.topic}
              className="flex items-baseline gap-2.5 py-2.5 border-b border-border last:border-b-0 cursor-pointer"
            >
              <span className="text-[28px] font-bold text-border leading-none min-w-[24px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1">
                <p className="text-[13px] text-ink-muted mb-0.5">
                  {item.label}
                </p>
                <p className="text-[15px] font-semibold text-ink leading-tight">
                  {item.topic}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Discover Tags */}
      <section className="mb-8">
        <h3 className="font-serif text-lg font-semibold text-ink mb-4">
          Discover more topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {DISCOVER_TAGS.map((tag) => (
            <button
              key={tag}
              className="bg-surface-alt rounded-full py-2 px-3.5 text-sm font-sans text-ink-light hover:bg-border transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Footer Links */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-y-1.5 gap-x-4">
          {FOOTER_LINKS.map((link) => (
            <span
              key={link}
              className="text-[13px] text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              {link}
            </span>
          ))}
        </div>
      </section>
    </aside>
  )
}
