import { Link } from 'react-router-dom'

const FOOTER_LINKS = {
  about: [
    { label: 'Customers', to: '/about' },
    { label: 'Our Team', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Integrations', to: '/integrations' },
    { label: 'Partners', to: '/about' },
    { label: 'Investors', to: '/about' },
    { label: 'Press', to: '/about' },
    { label: 'Sustainability & ESG', to: '/about' },
    { label: 'RemoteTeam Cares', to: '/about' },
    { label: 'Media Kit', to: '/about' },
    { label: 'How To Videos', to: '/about' },
    { label: 'Developer Platform', to: '/about' }
  ],
  download: [
    { label: 'RemoteTeam App', to: '/about' },
    { label: 'RemoteTeam Rooms', to: '/about' },
    { label: 'Rooms Controller', to: '/about' },
    { label: 'Browser Extension', to: '/about' },
    { label: 'Outlook Plug-in', to: '/about' },
    { label: 'iPhone/iPad App', to: '/about' },
    { label: 'Android App', to: '/about' },
    { label: 'Virtual Backgrounds', to: '/about' }
  ],
  sales: [
    { label: 'Contact Sales', to: '/about' },
    { label: 'Plans & Pricing', to: '/about' },
    { label: 'Request a Demo', to: '/about' },
    { label: 'Webinars and Events', to: '/about' },
    { label: 'Experience Center', to: '/about' },
    { label: 'RemoteTeam for Startups', to: '/about' }
  ],
  support: [
    { label: 'Test RemoteTeam', to: '/about' },
    { label: 'Account', to: '/dashboard' },
    { label: 'Support Center', to: '/about' },
    { label: 'Learning Center', to: '/about' },
    { label: 'Community', to: '/about' },
    { label: 'Technical Library', to: '/about' },
    { label: 'Feedback', to: '/about' },
    { label: 'Contact Us', to: '/about' },
    { label: 'Accessibility', to: '/about' }
  ]
}

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-100 dark:bg-[#060b18] border-t border-gray-200 dark:border-gray-800 pt-20 pb-10 transition-colors duration-500">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          
          {/* About */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-sm">About</h4>
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.about.map(item => (
                <Link key={item.label} to={item.to} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-[13px] no-underline hover:underline transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Download */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-sm">Download</h4>
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.download.map(item => (
                <Link key={item.label} to={item.to} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-[13px] no-underline hover:underline transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Sales */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-sm">Sales</h4>
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.sales.map(item => (
                <Link key={item.label} to={item.to} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-[13px] no-underline hover:underline transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold mb-6 text-sm">Support</h4>
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.support.map(item => (
                <Link key={item.label} to={item.to} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-[13px] no-underline hover:underline transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 dark:border-gray-800 pt-10">
           <div className="flex items-center gap-4 mb-6">
             <Link to="/" className="flex items-center gap-2 no-underline">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-white">RemoteTeam</span>
             </Link>
           </div>
           
           <div className="flex justify-between items-center flex-wrap gap-5">
              <div className="text-gray-600 dark:text-gray-500 text-xs">
                Copyright ©{new Date().getFullYear()} RemoteTeam Workspace, Inc. All rights reserved.
              </div>
              <div className="flex gap-4 flex-wrap">
                 {['Terms', 'Privacy', 'Trust Center', 'Acceptable Use', 'Legal & Compliance', 'Cookies Settings', 'Site Map'].map(l => (
                   <a key={l} href="#" className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs font-medium no-underline transition-colors">{l}</a>
                 ))}
              </div>
           </div>
        </div>
      </div>
      <style>{`
        .zoom-link:hover { color: #0b5cff !important; text-decoration: underline !important; }
      `}</style>
    </footer>
  )
}
