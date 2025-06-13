'use client';
import React from 'react';

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
}

function Panel({ onClose, children, title }: BaseProps) {
  return (
    <div className="panel-overlay">
      <div className="panel">
        <h2>{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
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
    <Panel onClose={onClose} title="Settings">
      <button onClick={onMainMenu}>Back to main menu</button>
      <label>
        Movement speed:
        <select value={settings.movement} onChange={(e) => handleChange('movement', e.target.value as Settings['movement'])}>
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </label>
      <label>
        Language:
        <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)}>
          <option value="en">English</option>
          <option value="nl">Dutch</option>
          <option value="jp">Japanese</option>
          <option value="ru">Russian</option>
          <option value="ar">Arabic</option>
        </select>
      </label>
      <label>
        <input type="checkbox" checked={settings.showLabels} onChange={(e) => handleChange('showLabels', e.target.checked)} />
        Show tile labels
      </label>
      <label>
        <input type="checkbox" checked={settings.animateDialogue} onChange={(e) => handleChange('animateDialogue', e.target.checked)} />
        Dialogue animation
      </label>
      <button onClick={reset}>Reset all settings</button>
    </Panel>
  );
}

interface ItemsPanelProps {
  items: string[];
  onClose: () => void;
}
export function ItemsPanel({ items, onClose }: ItemsPanelProps) {
  return (
    <Panel onClose={onClose} title="Items">
      {items.length === 0 ? <p>No items</p> : (
        <ul>{items.map((it) => <li key={it}>{it}</li>)}</ul>
      )}
    </Panel>
  );
}

interface SavePanelProps {
  saves: (SaveData | null)[];
  onSave: (slot: number) => void;
  onClose: () => void;
}
export function SavePanel({ saves, onSave, onClose }: SavePanelProps) {
  return (
    <Panel onClose={onClose} title="Save Game">
      {[1,2,3].map((slot) => {
        const data = saves[slot-1];
        return (
          <div key={slot}>
            <p>Slot {slot}: {data ? new Date(data.updatedAt).toLocaleString() : 'Empty'}</p>
            <button onClick={() => onSave(slot)}>Save to Slot {slot}</button>
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
}
export function LoadPanel({ saves, onLoad, onDelete, onClose }: LoadPanelProps) {
  return (
    <Panel onClose={onClose} title="Load Game">
      {[1,2,3].map((slot) => {
        const data = saves[slot-1];
        return (
          <div key={slot}>
            <p>Slot {slot}: {data ? new Date(data.updatedAt).toLocaleString() : 'Empty'}</p>
            {data ? (
              <>
                <button onClick={() => onLoad(slot)}>Load Slot {slot}</button>
                <button onClick={() => onDelete(slot)}>Delete Slot {slot}</button>
              </>
            ) : null}
          </div>
        );
      })}
    </Panel>
  );
}

