'use client';

import React, { useState, useMemo } from 'react';
import { iconRegistry, getLucideIcon, getTablerIcon, IconShapes } from '@platform/icon-library';
import { Search, X, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@heroui/react';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

export const IconPickerModal: React.FC<IconPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const icons = useMemo(() => {
    return Object.entries(iconRegistry).map(([name, iconData]) => ({
      name,
      category: iconData.category || 'misc',
      def: iconData,
    }));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(icons.map((i) => i.category));
    return ['all', ...Array.from(cats)].sort();
  }, [icons]);

  const filteredIcons = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return icons.filter((icon) => {
      const matchesCategory = selectedCategory === 'all' || icon.category === selectedCategory;
      const matchesSearch =
        !query ||
        icon.name.toLowerCase().includes(query) ||
        icon.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [icons, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 15, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          background: 'var(--color-bg-raised)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 12,
          boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 600,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-hairline)',
            background: 'var(--color-bg-raised)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-2)' }}>
            icon library
          </span>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              color: 'var(--color-ink-2)',
              minWidth: 0,
              width: 28,
              height: 28,
              padding: 0,
            }}
          >
            <X size={14} />
          </Button>
        </div>

        <div
          style={{
            padding: 12,
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 10px',
              height: 32,
              background: 'var(--color-bg)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 6,
            }}
          >
            <Search size={12} style={{ color: 'var(--color-ink-2)' }} />
            <input
              type="text"
              placeholder="grep icons…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--color-ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                flex: 1,
                height: '100%',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
            {categories.map((cat) => (
              <Button
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? 'primary' : 'ghost'}
                size="sm"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '0 10px',
                  height: 24,
                  background: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-bg)',
                  color: selectedCategory === cat ? 'var(--color-bg)' : 'var(--color-ink)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-hairline)',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {filteredIcons.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--color-ink-2)',
                gap: 8,
              }}
            >
              <ImageIcon size={28} style={{ opacity: 0.3 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>no icons · {searchQuery}</div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
                gap: 6,
              }}
            >
              {filteredIcons.map(({ name, def }) => {
                const isSelected = selectedIcon === name;
                return (
                  <Button
                    key={name}
                    onPress={() => {
                      onSelect(name);
                      onClose();
                    }}
                    variant="ghost"
                    size="sm"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 12,
                      background: 'var(--color-bg)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-hairline)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      position: 'relative',
                      height: 'auto',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                      }}
                    >
                      {def.source === 'lucide' && getLucideIcon(def.name) ? (
                        React.createElement(getLucideIcon(def.name)!, { size: 22, color: 'currentColor' })
                      ) : def.source === 'tabler' && getTablerIcon(def.name) ? (
                        React.createElement(getTablerIcon(def.name)!, { size: 22, color: 'currentColor', stroke: 1.5 })
                      ) : def.nodes && def.nodes.length > 0 ? (
                        <svg
                          viewBox={def.viewBox || '0 0 24 24'}
                          style={{ width: '100%', height: '100%', fill: 'currentColor' }}
                        >
                          <IconShapes def={def} currentColor={false} />
                        </svg>
                      ) : null}
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        textAlign: 'center',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                      }}
                    >
                      {name}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: 'var(--color-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={8} style={{ color: '#FFFFFF', strokeWidth: 4 }} />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--color-hairline)',
            background: 'var(--color-bg-raised)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-2)' }}>
            {filteredIcons.length} icons · {selectedCategory}
          </span>
          <Button
            onPress={onClose}
            variant="ghost"
            size="sm"
            style={{ height: 28, padding: '0 12px', fontSize: 11 }}
          >
            close
          </Button>
        </div>
      </div>
    </div>
  );
};
