'use client';
import React from 'react';
import { t } from '../../lib/lang';

export interface Settings {
  movement: 'slow' | 'normal' | 'fast';
  language: string;
  showLabels: boolean;
  animateDialogue: boolean;
}

export interface SaveData {
  mapId: string;
  player: { x: number; y: number };
  items: string[];
  updatedAt: string;
}

interface BaseProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  lang: string;
}

function Panel({ onClose, children, title, lang }: BaseProps) {
  return (
    <div className="panel-overlay">
      <div className="panel">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>{t('close', lang)}</button>
      </div>
    </div>
  );
}

interface SettingsPanelProps {
  settings: Settings;
  setSettings: (s: Settings) => void;
  onMainMenu: () => void;
  onClose: () => void;
  reset: () => void;
}
export function SettingsPanel({ settings, setSettings, onMainMenu, onClose, reset }: SettingsPanelProps) {
  const handleChange = (key: keyof Settings, value: Settings[keyof Settings]) => {
    setSettings({ ...settings, [key]: value });
  };
  return (
    <Panel onClose={onClose} title={t('settings', settings.language)} lang={settings.language}>
      <div className="settings-panel">
        <button onClick={onMainMenu} aria-label={t('backToMenu', settings.language)}>🔙 {t('backToMenu', settings.language)}</button>
        <label className="setting-group">
          ⏩ {t('movementSpeed', settings.language)}
          <select
            aria-label={t('movementSpeed', settings.language)}
            value={settings.movement}
            onChange={(e) => handleChange('movement', e.target.value as Settings['movement'])}
          >
            <option value="slow">{t('slow', settings.language)}</option>
            <option value="normal">{t('normal', settings.language)}</option>
            <option value="fast">{t('fast', settings.language)}</option>
          </select>
        </label>
        <label className="setting-group">
          🌍 {t('language', settings.language)}
          <select
            aria-label={t('language', settings.language)}
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <option value="en">🇬🇧 English</option>
            <option value="nl">🇳🇱 Nederlands</option>
            <option value="jp">🇯🇵 Japanese</option>
            <option value="ru">🇷🇺 Russian</option>
            <option value="ar">🇸🇦 Arabic</option>
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showLabels}
            onChange={(e) => handleChange('showLabels', e.target.checked)}
            aria-label={t('showTileLabels', settings.language)}
          />
          🧩 {t('showTileLabels', settings.language)}
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.animateDialogue}
            onChange={(e) => handleChange('animateDialogue', e.target.checked)}
            aria-label={t('dialogueAnimation', settings.language)}
          />
          💬 {t('dialogueAnimation', settings.language)}
        </label>
        <button onClick={reset} aria-label={t('resetSettings', settings.language)}>♻️ {t('resetSettings', settings.language)}</button>
      </div>
    </Panel>
  );
}

interface ItemsPanelProps {
  items: string[];
  onClose: () => void;
  lang: string;
}
export function ItemsPanel({ items, onClose, lang }: ItemsPanelProps) {
  return (
    <Panel onClose={onClose} title={t('items', lang)} lang={lang}>
      {items.length === 0 ? <p>{t('noItems', lang)}</p> : (
        <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
      )}
    </Panel>
  );
}

interface SavePanelProps {
  saves: (SaveData | null)[];
  onSave: (slot: number) => void;
  onClose: () => void;
  lang: string;
}
export function SavePanel({ saves, onSave, onClose, lang }: SavePanelProps) {
  return (
    <Panel onClose={onClose} title={t('saveGame', lang)} lang={lang}>
      {[1,2,3].map((slot) => {
        const data = saves[slot-1];
        return (
          <div key={slot}>
            <p>{t('slot', lang)} {slot}: {data ? new Date(data.updatedAt).toLocaleString() : t('empty', lang)}</p>
            <button onClick={() => onSave(slot)}>{t('saveToSlot', lang)} {slot}</button>
          </div>
        );
      })}
    </Panel>
  );
}

interface LoadPanelProps {
  saves: (SaveData | null)[];
  onLoad: (slot: number) => void;
  onDelete: (slot: number) => void;
  onClose: () => void;
  lang: string;
}
export function LoadPanel({ saves, onLoad, onDelete, onClose, lang }: LoadPanelProps) {
  return (
    <Panel onClose={onClose} title={t('loadGame', lang)} lang={lang}>
      {[1,2,3].map((slot) => {
        const data = saves[slot-1];
        return (
          <div key={slot}>
            <p>{t('slot', lang)} {slot}: {data ? new Date(data.updatedAt).toLocaleString() : t('empty', lang)}</p>
            {data ? (
              <>
                <button onClick={() => onLoad(slot)}>{t('loadSlot', lang)} {slot}</button>
                <button onClick={() => onDelete(slot)}>{t('deleteSlot', lang)} {slot}</button>
              </>
            ) : null}
          </div>
        );
      })}
    </Panel>
  );
}

