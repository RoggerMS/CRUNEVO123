import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Flag, EyeOff, Bookmark, Trash2, HelpCircle, Lock, Eye } from 'lucide-react';

interface FeedMenuProps {
  isAuthor: boolean;
  viewVisibility: boolean;
  onToggleViewVisibility: () => void;
  onHide: () => void;
  onReport: () => void;
  onNotInterested: () => void;
  onBookmark: () => void;
  onExplain: () => void;
  onPrivacy: () => void;
}

export default function FeedMenu({
  isAuthor,
  viewVisibility,
  onToggleViewVisibility,
  onHide,
  onReport,
  onNotInterested,
  onBookmark,
  onExplain,
  onPrivacy
}: FeedMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="feed-menu" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        className="feed-menu-trigger"
        aria-label="Opciones de la publicación"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="feed-menu-dropdown" role="menu">
          <button type="button" role="menuitem" onClick={() => handleAction(onReport)}>
            <Flag size={16} /> Reportar
          </button>
          <button type="button" role="menuitem" onClick={() => handleAction(onNotInterested)}>
            <EyeOff size={16} /> No me interesa
          </button>
          <button type="button" role="menuitem" onClick={() => handleAction(onBookmark)}>
            <Bookmark size={16} /> Guardar
          </button>
          <button type="button" role="menuitem" onClick={() => handleAction(onHide)}>
            <Trash2 size={16} /> Ocultar
          </button>
          <button type="button" role="menuitem" onClick={() => handleAction(onExplain)}>
            <HelpCircle size={16} /> ¿Por qué veo esto?
          </button>

          {isAuthor && (
            <>
              <hr />
              <div className="feed-menu-section-title">Configuración del autor</div>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleAction(onToggleViewVisibility)}
              >
                <Eye size={16} />
                {viewVisibility ? 'Ocultar vistas al público' : 'Mostrar vistas al público'}
              </button>
              <button type="button" role="menuitem" onClick={() => handleAction(onPrivacy)}>
                <Lock size={16} /> Privacidad del post
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
