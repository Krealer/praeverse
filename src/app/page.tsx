'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type TileType = 'GROUND' | 'WALL' | 'NPC';

interface Tile {
  x: number;
  y: number;
  type: TileType;
  npcColor?: string;
  dialogueId?: string;
}

const gridSize = 10;

const createGrid = (): Tile[][] => {
  const grid: Tile[][] = [];

  for (let y = 0; y < gridSize; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < gridSize; x++) {
      if (
        x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1 ||
        (x === 5 && y !== 2)
      ) {
        row.push({ x, y, type: 'WALL' });
      } else if (x === 3 && y === 3) {
        row.push({
          x,
          y,
          type: 'NPC',
          npcColor: '#2aa',
          dialogueId: 'npc_1',
        });
      } else {
        row.push({ x, y, type: 'GROUND' });
      }
    }
    grid.push(row);
  }

  return grid;
};

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [grid] = useState<Tile[][]>(createGrid());
  const [player, setPlayer] = useState({ x: 1, y: 1 });

  // Restore saved player position on first load
  useEffect(() => {
    const saved = localStorage.getItem('player-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number'
        ) {
          setPlayer({ x: parsed.x, y: parsed.y });
        }
      } catch (err) {
        console.error('Could not parse saved player position', err);
      }
    }
  }, []);

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

  const handleClick = useCallback((tile: Tile, isDouble = false) => {
    const dx = Math.abs(tile.x - player.x);
    const dy = Math.abs(tile.y - player.y);
    const isAdjacent = dx + dy === 1;

    if (isDouble && tile.type === 'NPC' && tile.dialogueId) {
      setDialogue(`NPC says: "This isn't the beginning. It's before that."`);
      return;
    }

    if (tile.type === 'GROUND' && isAdjacent) {
      setPlayer({ x: tile.x, y: tile.y });
    }
  }, [player]);

  // Save player position whenever it changes
  useEffect(() => {
    localStorage.setItem('player-position', JSON.stringify(player));
  }, [player]);

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
            const isPlayer = tile.x === player.x && tile.y === player.y;

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
                      : undefined,
                }}
                onClick={() => handleClick(tile)}
                onDoubleClick={() => handleClick(tile, true)}
                tabIndex={0}
              >
                {tile.type === 'NPC' && (
                  <div
                    className="circle"
                    style={{ backgroundColor: tile.npcColor || 'blue' }}
                  />
                )}
                {isPlayer && <div className="circle player" />}
              </div>
            );
          })
        )}
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
