'use client';

import { useState, useEffect, useCallback } from 'react';
import { findPath } from '../lib/pathfinding';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Tile } from '../lib/types';
import map01 from '../maps/map01';
import map02 from '../maps/map02';

const maps: Record<string, Tile[][]> = { map01, map02 };

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [currentMap, setCurrentMap] = useState('map01');
  const [grid, setGrid] = useState<Tile[][]>(maps[currentMap]);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    setGrid(maps[currentMap]);
  }, [currentMap]);

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

  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');

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

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert('Login error: ' + error.message);
    } else {
      alert('Check your email for a magic login link.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleClick = useCallback(
    (tile: Tile, isDouble = false) => {
      if (isDouble && tile.type === 'NPC' && tile.dialogueId) {
        setDialogue(`NPC says: "This isn't the beginning. It's before that."`);
        return;
      }

      if (tile.type === 'GROUND' || tile.type === 'DOOR') {
        const newPath = findPath(grid, player, { x: tile.x, y: tile.y });
        if (newPath.length > 0) {
          setPath(newPath);
        }
      }
    },
    [player, grid]
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
    }, 250);
    return () => clearTimeout(timer);
  }, [path, grid, setCurrentMap]);

  // Save player position whenever it changes
  useEffect(() => {
    savePosition(currentMap, player);
  }, [player, currentMap, savePosition]);

  if (menuVisible) {
    return (
      <div className="menu-screen">
        <h1 className="title">Praeverse</h1>
        <button onClick={() => setMenuVisible(false)} aria-label="Start Game">▶ Play</button>
        <button onClick={() => setShowHelp(true)} aria-label="How to Play">📖 How to Play</button>

        {user ? (
          <>
            <p>Logged in as: {user.email}</p>
            <button onClick={handleLogout} aria-label="Log Out">🚪 Log Out</button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="menu-input"
            />
            <button onClick={handleLogin} aria-label="Send Magic Link">🔐 Send Magic Link</button>
          </>
        )}

        {showHelp && (
          <div className="modal">
            <p><strong>How to Play:</strong></p>
            <ul>
              <li>Tap a gray tile to move.</li>
              <li>Double tap a colored circle (NPC) to interact.</li>
              <li>Dark tiles are walls — they block movement.</li>
            </ul>
            <button onClick={() => setShowHelp(false)} aria-label="Close Help">Close</button>
          </div>
        )}
      </div>
    );
  }

  return (
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
              </div>
            );
          })
        )}
        <div
          className="circle player"
          style={{ top: `${player.y * 10}%`, left: `${player.x * 10}%` }}
        />
      </div>

      {dialogue && (
        <div className="dialogue">
          {dialogue}
          <button onClick={() => setDialogue(null)} aria-label="Close Dialogue">Close</button>
        </div>
      )}
    </main>
  );
}
