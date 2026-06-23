import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Previews | Sierra Estates Design System',
  description: 'Explore all Sierra Estates design iterations and prototypes — from early landing pages to premium portals.',
};

const PREVIEWS = [
  {
    slug: 'landing-v1',
    title: 'Landing v1',
    label: 'First Landing',
    desc: 'The inaugural sierra estates landing page. Clean foundations, establishing the brand palette.',
    tag: 'Origin',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  {
    slug: 'landing-v2',
    title: 'Landing v2',
    label: 'Enhanced Landing',
    desc: 'Enhanced layout with advanced property filters and compound-level navigation.',
    tag: 'Evolution',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  {
    slug: 'landing-2.6',
    title: 'Landing 2.6',
    label: 'Latest Full Landing',
    desc: 'Sierra Estates 2.6 — the most complete standalone landing page to date.',
    tag: 'Latest',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  {
    slug: 'portal-v3',
    title: 'Portal v3',
    label: 'Property Portal',
    desc: 'sierra estates Property Portal — early iteration with map integration and listing grid.',
    tag: 'Portal',
    tagColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  {
    slug: 'portal-v4',
    title: 'Portal v4',
    label: 'Property Portal+',
    desc: 'Refined portal with advanced filtering, compound cards, and enhanced UX.',
    tag: 'Portal',
    tagColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  },
  {
    slug: 'hero-section',
    title: 'Hero Section',
    label: 'Standalone Hero',
    desc: 'Cinematic hero section module — full-bleed immersive luxury real estate visual.',
    tag: 'Component',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  {
    slug: 'admin-ui',
    title: 'Admin UI',
    label: 'Dashboard Shell',
    desc: 'Sierra Estates Admin Dashboard — the operational command center interface.',
    tag: 'Admin',
    tagColor: 'bg-red-500/10 text-red-400 border-red-500/30',
  },
  {
    slug: 'premium-landing',
    title: 'Premium Dark',
    label: 'Premium Landing',
    desc: 'Full dark-mode premium landing with cinematic video backdrop and gold accents.',
    tag: 'Premium',
    tagColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  {
    slug: 'landing-refined',
    title: 'Landing Refined',
    label: 'Clean Luxury',
    desc: 'Minimal clean luxury variant — refined typography, maximum whitespace.',
    tag: 'Refined',
    tagColor: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  },
];

export default function DesignPreviewsPage() {
  return (
    <div className="min-h-screen bg-[#071422] text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-mono tracking-[0.25em] uppercase rounded-full mb-6">
            Design System Archive
          </span>
          <h1 className="font-playfair text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            Design Previews
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
            Every iteration that shaped Sierra Estates — from founding wireframes to the current premium platform.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREVIEWS.map((preview) => (
            <a
              key={preview.slug}
              href={`/design-previews/${preview.slug}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C9A84C]/50 hover:bg-white/8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Preview Thumbnail Area */}
              <div className="relative h-36 rounded-xl bg-gradient-to-br from-[#0A1520] to-[#0d2035] mb-5 overflow-hidden border border-white/5 group-hover:border-[#C9A84C]/20 transition-colors">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-20 group-hover:opacity-40 transition-opacity">🏛️</div>
                    <span className="text-xs font-mono text-white/20 group-hover:text-white/40 transition-colors tracking-widest uppercase">
                      {preview.slug}.html
                    </span>
                  </div>
                </div>
                {/* Gold shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A84C]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              {/* Content */}
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-playfair text-xl font-semibold text-white group-hover:text-[#E9C176] transition-colors">
                  {preview.title}
                </h2>
                <span className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider border rounded-full ${preview.tagColor}`}>
                  {preview.tag}
                </span>
              </div>

              <p className="text-xs font-mono text-[#C9A84C] mb-3 tracking-wider uppercase">
                {preview.label}
              </p>

              <p className="text-sm text-white/60 leading-relaxed flex-1">
                {preview.desc}
              </p>

              <div className="flex items-center gap-2 mt-5 text-xs text-white/40 group-hover:text-[#C9A84C] transition-colors font-mono">
                <span>Open Preview</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 pt-8 border-t border-white/5">
          <p className="text-xs text-white/30 font-mono tracking-widest uppercase">
            Sierra Estates Design System © {new Date().getFullYear()} · All Iterations Archived
          </p>
        </div>
      </div>
    </div>
  );
}
