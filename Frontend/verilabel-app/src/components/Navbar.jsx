import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Records', to: '/records' },
    { label: 'Upload', to: '/upload' },
  ];

  return (
    <header className="bg-white shadow-sm w-full z-50 flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-12">
        <span className="text-2xl font-bold text-[#004275] tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
          VeriLabel
        </span>
        <nav className="hidden md:flex gap-8">
          {links.map(({ label, to }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`font-semibold tracking-tight transition-colors duration-200 ${
                  active ? 'text-[#004275] border-b-2 border-[#004275] pb-1' : 'text-slate-500 hover:text-[#004275]'
                }`}
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c1c7d2] text-sm">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-[#f0f4fd] border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#004275] outline-none transition-all"
            placeholder="Search records..."
            type="text"
          />
        </div>
        <button className="p-2 text-[#414750] hover:bg-[#eaeef7] transition-colors rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-[#414750] hover:bg-[#eaeef7] transition-colors rounded-full">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}