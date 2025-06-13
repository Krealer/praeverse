'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { findPath } from '../lib/pathfinding';
import { t } from '../lib/lang';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Tile } from '../lib/types';
import map01 from '../maps/map01';
import map02 from '../maps/map02';
import {
  Settings,
  SaveData,
  SettingsPanel,
  ItemsPanel,
  SavePanel,
  LoadPanel,
} from './components/Panels';

const maps: Record<string, Tile[][]> = { map01, map02 };

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [displayDialogue, setDisplayDialogue] = useState<string | null>(null);
  const [currentMap, setCurrentMap] = useState('map01');
  const [grid, setGrid] = useState<Tile[][]>(maps[currentMap]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const defaultSettings = useMemo<Settings>(
    () => ({
      movement: 'normal',
      language: 'en',
      showLabels: false,
      animateDialogue: true,
    }),
    []
  );
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activePanel, setActivePanel] = useState<
    'settings' | 'items' | 'save' | 'load' | null
  >(null);
  const [saves, setSaves] = useState<(SaveData | null)[]>([null, null, null]);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const movementDelay =
    settings.movement === 'slow' ? 400 : settings.movement === 'fast' ? 100 : 200;

  useEffect(() => {
    setGrid(maps[currentMap]);
  }, [currentMap]);

  // Load saves from localStorage when not logged in
  useEffect(() => {
    if (user) return;
    const arr: (SaveData | null)[] = [null, null, null];
    [1, 2, 3].forEach((slot) => {
      try {
        const raw = localStorage.getItem(`praeverse_slot_${slot}`);
        if (raw) arr[slot - 1] = JSON.parse(raw);
      } catch {
        // ignore
      }
    });
    setSaves(arr);
  }, [user, defaultSettings]);

  // Load settings from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('praeverse_settings');
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  }, [defaultSettings]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('praeverse_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
    if (user) {
  (async () => {
    try {
      await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, settings });
    } catch (err) {
      console.error('Failed to save settings to Supabase:', err);
    }
  })();
 }

  }, [settings, user]);

  const loadPosition = useCallback((mapId: string) => {
    try {
      const saved = localStorage.getItem(`praeverse_position_${mapId}`);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return { x: parsed.x, y: parsed.y };
      }
    } catch {
      // ignore read errors
    }
    return null;
  }, []);

  const savePosition = useCallback((mapId: string, pos: { x: number; y: number }) => {
    try {
      localStorage.setItem(`praeverse_position_${mapId}`, JSON.stringify(pos));
    } catch {
      // ignore write errors
    }
  }, []);

  // Restore player position when map changes
  useEffect(() => {
    const stored = loadPosition(currentMap);
    if (stored) {
      setPlayer(stored);
    } else {
      setPlayer({ x: 1, y: 1 });
    }
  }, [currentMap, loadPosition]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // When user logs in, load settings and saves from Supabase
  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchData = async () => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('settings')
        .eq('user_id', user.id)
        .single();
      if (profile?.settings) {
        setSettings({ ...defaultSettings, ...profile.settings });
      }
      const { data: saveRows } = await supabase
        .from('user_saves')
        .select('slot,data,updated_at')
        .eq('user_id', user.id);
      if (saveRows) {
        const arr: (SaveData | null)[] = [null, null, null];
        for (const row of saveRows) {
          arr[row.slot - 1] = { ...(row.data as SaveData), updatedAt: row.updated_at };
        }
        setSaves(arr);
      }
    };
    fetchData().catch(() => {});
  }, [user, defaultSettings]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert('Login error: ' + error.message);
    } else {
      alert(t('checkEmail', settings.language));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const startDialogue = useCallback(
    (text: string) => {
      if (settings.animateDialogue) {
        setDisplayDialogue('');
        let i = 0;
        const timer = setInterval(() => {
          i++;
          setDisplayDialogue(text.slice(0, i));
          if (i >= text.length) {
            clearInterval(timer);
          }
        }, 30);
        return () => clearInterval(timer);
      }
      setDisplayDialogue(text);
      return () => {};
    },
    [settings.animateDialogue]
  );

  const handleClick = useCallback(
    (tile: Tile, isDouble = false) => {
      if (isDouble && tile.type === 'NPC' && tile.dialogueId) {
        startDialogue(`NPC says: "This isn't the beginning. It's before that."`);
        return;
      }

      if (tile.type === 'GROUND' || tile.type === 'DOOR') {
        const newPath = findPath(grid, player, { x: tile.x, y: tile.y });
        if (newPath.length > 0) {
          setPath(newPath);
        }
      }
    },
    [player, grid, startDialogue]
  );

  const handleSave = useCallback(
  async (slot: number) => {
    const data: SaveData = {
      mapId: currentMap,
      player,
      items,
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        await supabase
          .from('user_saves')
          .upsert({
            user_id: user.id,
            slot,
            data,
            updated_at: data.updatedAt,
          });
      } catch (err) {
        console.error(`❌ Failed to save slot ${slot} to Supabase:`, err);
      }
    } else {
      try {
        localStorage.setItem(`praeverse_slot_${slot}`, JSON.stringify(data));
      } catch (err) {
        console.warn(`⚠️ Failed to save slot ${slot} to localStorage:`, err);
      }
    }

    setSaves((prev) => {
      const arr = [...prev];
      arr[slot - 1] = data;
      return arr;
    });
  },
  [currentMap, player, items, user]
);


  const handleLoad = useCallback(
    (slot: number) => {
      const data = saves[slot - 1];
      if (!data) return;
      setCurrentMap(data.mapId);
      setGrid(maps[data.mapId]);
      setPlayer(data.player);
      setItems(data.items);
    },
    [saves]
  );

  const handleDelete = useCallback(
  async (slot: number) => {
    if (user) {
      try {
        await supabase
          .from('user_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('slot', slot);
      } catch (err) {
        console.error(`❌ Failed to delete save slot ${slot} from Supabase:`, err);
      }
    } else {
      try {
        localStorage.removeItem(`praeverse_slot_${slot}`);
      } catch (err) {
        console.warn(`⚠️ Failed to remove local save slot ${slot}:`, err);
      }
    }

    setSaves((prev) => {
      const arr = [...prev];
      arr[slot - 1] = null;
      return arr;
    });
  },
  [user]
);


  // Step along the current path
  useEffect(() => {
    if (path.length === 0) return;
    const timer = setTimeout(() => {
      const [next, ...rest] = path;
      setPlayer(next);
      setPath(rest);

      if (rest.length === 0) {
        const tile = grid[next.y]?.[next.x];
        if (tile && tile.type === 'DOOR' && tile.destination) {
          setCurrentMap(tile.destination);
        }
      }
    }, movementDelay);
    return () => clearTimeout(timer);
  }, [path, grid, setCurrentMap, movementDelay]);

  // Save player position whenever it changes
  useEffect(() => {
    savePosition(currentMap, player);
  }, [player, currentMap, savePosition]);

  if (menuVisible) {
    return (
      <div className="menu-screen">
        <h1 className="title">Praeverse</h1>
        <button onClick={() => setMenuVisible(false)} aria-label={t('play', settings.language)}>▶ {t('play', settings.language)}</button>
        <button onClick={() => setShowHelp(true)} aria-label={t('howToPlay', settings.language)}>📖 {t('howToPlay', settings.language)}</button>

        {user ? (
          <>
            <p>{t('loggedInAs', settings.language)} {user.email}</p>
            <button onClick={handleLogout} aria-label={t('logOut', settings.language)}>🚪 {t('logOut', settings.language)}</button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder={t('loginPrompt', settings.language)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="menu-input"
            />
            <button onClick={handleLogin} aria-label={t('sendMagicLink', settings.language)}>🔐 {t('sendMagicLink', settings.language)}</button>
          </>
        )}

        {showHelp && (
          <div className="modal">
            <p><strong>{t('howToPlayTitle', settings.language)}</strong></p>
            <ul>
              <li>{t('instructionMove', settings.language)}</li>
              <li>{t('instructionInteract', settings.language)}</li>
              <li>{t('instructionWalls', settings.language)}</li>
            </ul>
            <button onClick={() => setShowHelp(false)} aria-label={t('close', settings.language)}>{t('close', settings.language)}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <main>
        <h1 className="title">Praeverse</h1>
        <div className="grid">
        {grid.map((row) =>
          row.map((tile) => {

            return (
              <div
                key={`${tile.x}-${tile.y}`}
                className={`tile ${tile.type.toLowerCase()}`}
                style={{
                  backgroundColor:
                    tile.type === 'GROUND'
                      ? '#999'
                      : tile.type === 'WALL'
                      ? '#333'
                      : tile.type === 'DOOR'
                      ? 'purple'
                      : undefined,
                }}
                onClick={() => handleClick(tile)}
                onDoubleClick={() => handleClick(tile, true)}
                tabIndex={0}
              >
                {tile.type === 'NPC' && (
                  <div
                    className="circle npc"
                    style={{ backgroundColor: tile.npcColor || 'blue' }}
                  />
                )}
                {settings.showLabels && (
                  <span className="tile-label">{tile.type}</span>
                )}
              </div>
            );
          })
        )}
        <div
          className="circle player"
          style={{
            top: `${(player.y + 0.5) * 10}%`,
            left: `${(player.x + 0.5) * 10}%`,
          }}
        />
      </div>

      {displayDialogue && (
        <div className="dialogue">
          {displayDialogue}
          <button
              onClick={() => {
              setDisplayDialogue(null);
            }}
            aria-label={t('close', settings.language)}
          >
            {t('close', settings.language)}
          </button>
        </div>
      )}
      </main>
      <div className="bottom-menu">
        <button onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}>
          {t('settings', settings.language)}
        </button>
        <button onClick={() => setActivePanel(activePanel === 'items' ? null : 'items')}>
          {t('items', settings.language)}
        </button>
        <button onClick={() => setActivePanel(activePanel === 'save' ? null : 'save')}>
          {t('save', settings.language)}
        </button>
        <button onClick={() => setActivePanel(activePanel === 'load' ? null : 'load')}>
          {t('load', settings.language)}
        </button>
      </div>
      {activePanel === 'settings' && (
        <SettingsPanel
          settings={settings}
          setSettings={setSettings}
          onMainMenu={() => setMenuVisible(true)}
          onClose={() => setActivePanel(null)}
          reset={() => {
            setSettings(defaultSettings);
            localStorage.removeItem('praeverse_settings');
          }}
        />
      )}
      {activePanel === 'items' && (
        <ItemsPanel items={items} onClose={() => setActivePanel(null)} lang={settings.language} />
      )}
      {activePanel === 'save' && (
        <SavePanel
          saves={saves}
          onSave={handleSave}
          onClose={() => setActivePanel(null)}
          lang={settings.language}
        />
      )}
      {activePanel === 'load' && (
        <LoadPanel
          saves={saves}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onClose={() => setActivePanel(null)}
          lang={settings.language}
        />
      )}
    </>
  );
}
