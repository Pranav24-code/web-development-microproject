import React, { useState } from "react";
import "./index.css";

export default function App() {
  const [balance, setBalance] = useState(5000);
  const [gameActive, setGameActive] = useState(false);
  const [bombPositions, setBombPositions] = useState([]);
  const [revealedTiles, setRevealedTiles] = useState([]);
  const [currentBet, setCurrentBet] = useState(0);
  const [currentWin, setCurrentWin] = useState(0);
  const [safeCount, setSafeCount] = useState(0);
  const [bombCount, setBombCount] = useState(3);
  const [betAmount, setBetAmount] = useState(100);
  const [message, setMessage] = useState("Welcome! Click Start Game to play.");
  const [loss, setLoss] = useState(false);

  const multipliers = [1.1, 1.2, 1.4, 1.7, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0];

  const getMultiplier = (safeTiles) => {
    if (safeTiles === 0) return 1;
    const idx = Math.min(safeTiles - 1, multipliers.length - 1);
    return multipliers[idx];
  };

  const startGame = () => {
    const bet = parseFloat(betAmount);
    const bombs = parseInt(bombCount);

    if (bet > balance) {
      setMessage("❗ Insufficient balance!");
      setLoss(true);
      return;
    }

    // generate random bomb positions
    const randomBombs = [];
    while (randomBombs.length < bombs) {
      const pos = Math.floor(Math.random() * 25);
      if (!randomBombs.includes(pos)) randomBombs.push(pos);
    }

    setBombPositions(randomBombs);
    setRevealedTiles([]);
    setCurrentBet(bet);
    setCurrentWin(bet);
    setSafeCount(0);
    setBalance((prev) => prev - bet);
    setGameActive(true);
    setMessage("⛏️ Game started! Click tiles to dig...");
    setLoss(false);
  };

  const revealTile = (index) => {
    if (!gameActive || revealedTiles.includes(index)) return;

    const newRevealed = [...revealedTiles, index];
    setRevealedTiles(newRevealed);

    // if bomb
    if (bombPositions.includes(index)) {
      setGameActive(false);
      setMessage("💥 Boom! You hit a bomb.");
      setLoss(true);
      setCurrentWin(0);
      return;
    }

    // safe tile
    const newSafe = safeCount + 1;
    const newMult = getMultiplier(newSafe);
    const newWin = currentBet * newMult;

    setSafeCount(newSafe);
    setCurrentWin(newWin);
    setMessage("💎 Safe! Keep going or cash out?");
    setLoss(false);

    // if all safe tiles revealed automatically cash out
    if (newSafe === 25 - bombPositions.length) {
      cashOut(newWin);
    }
  };

  const cashOut = (amount = currentWin) => {
    if (!gameActive && safeCount === 0) return;

    setBalance((prev) => prev + amount);
    setGameActive(false);
    setMessage(`💰 CASHED OUT! You won $${amount.toFixed(2)}.`);
    setLoss(false);
    setCurrentWin(0);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>⛏️ BOMB MINING</h1>
        <p className="subtitle">Click tiles to find diamonds. Avoid bombs!</p>
      </div>

      <div className="controls">
        <div className="input-group">
          <label>Bombs:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={bombCount}
            onChange={(e) => setBombCount(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Bet Amount:</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="button-group">
        <button className="btn-start" onClick={startGame} disabled={gameActive}>
          START GAME
        </button>
        <button
          className="btn-cash"
          onClick={() => cashOut(currentWin)}
          disabled={!gameActive}
        >
          CASH OUT
        </button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-value">${balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Win</div>
          <div className="stat-value">${currentWin.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Multiplier</div>
          <div className="stat-value">{getMultiplier(safeCount)}x</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Safe Tiles</div>
          <div className="stat-value">{safeCount}</div>
        </div>
      </div>

      <div className="game-board">
        {Array.from({ length: 25 }, (_, i) => {
          const revealed = revealedTiles.includes(i);
          const isBomb = bombPositions.includes(i);
          let tileClass = "tile";
          let symbol = "?";

          if (revealed) {
            tileClass += " revealed";
            if (isBomb) {
              tileClass += " bomb";
              symbol = "💣";
            } else {
              tileClass += " safe";
              symbol = "💎";
            }
          }

          return (
            <div
              key={i}
              className={tileClass}
              onClick={() => revealTile(i)}
            >
              {symbol}
            </div>
          );
        })}
      </div>

      <div className={`message ${loss ? "loss" : ""}`}>{message}</div>
    </div>
  );
}