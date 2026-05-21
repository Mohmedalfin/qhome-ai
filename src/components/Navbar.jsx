import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle window scroll to trigger floating active/shrink state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Beranda', href: '#root' },
    { id: 'features', label: 'Fitur', href: '#next-steps' },
    { id: 'docs', label: 'Dokumentasi', href: '#docs' },
    { id: 'social', label: 'Komunitas', href: '#social' }
  ];

  const handleLinkClick = (id) => {
    setActiveItem(id);
    setMobileOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Mencari: "${searchQuery}"`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className={`glass-navbar-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="glass-navbar-container">
        {/* Brand Logo */}
        <a href="#root" className="brand-logo" onClick={() => handleLinkClick('home')}>
          <div className="logo-icon-wrapper">
            <svg
              className="logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="brand-name">Q<span className="accent-text">Home</span></span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          {menuItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`nav-link ${activeItem === item.id ? 'is-active' : ''}`}
              onClick={() => handleLinkClick(item.id)}
            >
              {item.label}
              {activeItem === item.id && <span className="active-pill" />}
            </a>
          ))}
        </nav>

        {/* Right Action Utilities */}
        <div className="nav-actions">
          {/* Search Toggle */}
          <div className={`search-container ${searchOpen ? 'search-active' : ''}`}>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Cari sesuatu..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!searchOpen}
              />
            </form>
            <button
              type="button"
              className="action-btn search-toggle"
              aria-label="Cari"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>

          {/* Dynamic CTA button */}
          <a href="#next-steps" className="cta-button">
            <span>Mulai Sekarang</span>
            <svg
              className="cta-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>

          {/* Hamburger Menu Toggle (Mobile Only) */}
          <button
            type="button"
            className={`hamburger-toggle ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line line-top" />
            <span className="hamburger-line line-mid" />
            <span className="hamburger-line line-bot" />
          </button>
        </div>
      </div>

      {/* Mobile Glass Navigation Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'is-open' : ''}`}>
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} />
        <nav className="mobile-nav">
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-title">Menu Utama</span>
          </div>
          <div className="mobile-nav-links">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`mobile-nav-link ${activeItem === item.id ? 'is-active' : ''}`}
                onClick={() => handleLinkClick(item.id)}
              >
                <span className="link-number">0{menuItems.indexOf(item) + 1}.</span>
                <span className="link-text">{item.label}</span>
                <svg
                  className="link-arrow"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </a>
            ))}
          </div>

          <div className="mobile-drawer-footer">
            <a href="#next-steps" className="cta-button mobile-cta" onClick={() => setMobileOpen(false)}>
              <span>Mulai Sekarang</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
