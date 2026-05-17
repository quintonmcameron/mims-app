"use client";

import type { CSSProperties, ReactNode } from "react";
import type { ScreenId } from "@/lib/mims/engine";

export function IconBack({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label="Back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
  );
}

export function ChipGroup({
  options,
  value,
  values,
  multi = false,
  onChange,
}: {
  options: { id: string; label: string }[];
  value?: string;
  values?: string[];
  multi?: boolean;
  onChange: (next: string | string[]) => void;
}) {
  return (
    <div className="chips">
      {options.map((opt) => {
        const active = multi
          ? (values ?? []).includes(opt.id)
          : value === opt.id;
        return (
          <div
            key={opt.id}
            role="button"
            tabIndex={0}
            className={`chip${active ? " active" : ""}`}
            onClick={() => {
              if (multi) {
                const set = new Set(values ?? []);
                if (set.has(opt.id)) set.delete(opt.id);
                else set.add(opt.id);
                onChange([...set]);
              } else {
                onChange(opt.id);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).click();
              }
            }}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}

export function Seg({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="seg">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={value === opt.id ? "active" : ""}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function TabBar({
  active,
  onNavigate,
}: {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
}) {
  const tabs: { id: ScreenId; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12L12 3l9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      id: "deals",
      label: "Deals",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      id: "library",
      label: "Playbook",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 19V5a2 2 0 012-2h12v18H6a2 2 0 01-2-2z" />
          <path d="M9 7h6M9 11h6" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "You",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab${active === tab.id ? " active" : ""}`}
          onClick={() => onNavigate(tab.id)}
        >
          <div className="tab-ico">{tab.icon}</div>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function DealItem({
  initials,
  avatarStyle,
  title,
  meta,
  badge,
  badgeClass,
  onClick,
}: {
  initials: string;
  avatarStyle: CSSProperties;
  title: string;
  meta: string;
  badge: string;
  badgeClass: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="deal-item" onClick={onClick}>
      <div className="avatar" style={avatarStyle}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <h4>{title}</h4>
        <div className="meta">{meta}</div>
      </div>
      <span className={`badge ${badgeClass}`}>{badge}</span>
    </button>
  );
}
