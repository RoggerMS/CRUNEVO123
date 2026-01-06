import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Grid3x3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export type AppMenuItem = {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
};

export type AppMenuSection = {
  title: string;
  items: AppMenuItem[];
};

interface AppMenuProps {
  sections: AppMenuSection[];
}

export function AppMenu({ sections }: AppMenuProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }

    if (!open) {
      setQuery('');
    }
  }, [open]);

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sections;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          `${item.label} ${item.description}`.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query, sections]);

  return (
    <div className="topbar-menu" ref={menuRef}>
      <button
        type="button"
        className="topbar-icon-button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir menú de aplicaciones"
        aria-expanded={open}
      >
        <Grid3x3 size={18} />
      </button>

      {open && (
        <div className="app-menu-panel">
          <div className="app-menu-header">
            <div>
              <h3 className="app-menu-title">Menú</h3>
              <p className="app-menu-subtitle">Accede rápido a cualquier sección de CRUNEVO.</p>
            </div>
            <div className="app-menu-search">
              <Search size={16} className="app-menu-search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Busca en el menú"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="app-menu-content">
            {filteredSections.length === 0 ? (
              <div className="app-menu-empty">No encontramos resultados con esa búsqueda.</div>
            ) : (
              filteredSections.map((section) => (
                <div className="app-menu-section" key={section.title}>
                  <h4>{section.title}</h4>
                  <div className="app-menu-items">
                    {section.items.map((item) => (
                      <Link className="app-menu-item" key={item.to} to={item.to} onClick={() => setOpen(false)}>
                        <div className="app-menu-item-icon">{item.icon}</div>
                        <div>
                          <div className="app-menu-item-label">{item.label}</div>
                          <div className="app-menu-item-description">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AppMenu;
