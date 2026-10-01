"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { DonutArt } from "./ArcadeArt";
import { drawFlappyBackground, drawFlappyPipe, drawFlappyPowerUp, flappyPalette } from "./flappyDonutArt";
import styles from "../styles/FlappyDonut.module.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: "slowmo" | "shield";
  active: boolean;
}

export default function FlappyDonut() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const donutArtRef = useRef<HTMLDivElement>(null);
  const donutImageRef = useRef<HTMLImageElement | null>(null);
  const soundContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const svg = donutArtRef.current?.querySelector("svg");
    if (svg) {
      const sprite = svg.cloneNode(true) as SVGSVGElement;
      sprite.setAttribute("width", "220");
      sprite.setAttribute("height", "220");
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(sprite))}`;
      donutImageRef.current = image;
    }
    return () => {
      soundContextRef.current?.close();
      soundContextRef.current = null;
    };
  }, []);

  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flappy-donut-high-score");
    const score = Number(saved);
    if (Number.isSafeInteger(score) && score >= 0) setHighScore(score);
  }, []);

  // Save high score
  useEffect(() => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem("flappy-donut-high-score", finalScore.toString());
    }
  }, [finalScore, highScore]);

  function initializeGame() {
    return {
      bird: {
        x: 80,
        y: 250,
        width: 50,
        height: 50,
        velocity: 0,
        gravity: 0.3,
        jump: -7,
        rotation: 0,
      },
      pipes: [] as {
        x: number;
        topHeight: number;
        passed: boolean;
        gap?: number; // Track individual pipe gap
      }[],
      frame: 0,
      pipeGap: 160,
      score: 0,
      particles: [] as Particle[],
      powerUps: [] as PowerUp[],
      slowMotion: false,
      shield: false,
      powerUpTimer: 0,
      pipeWidth: 60,
      spawnTimer: 90,
      spawnBase: 100,
      spawnRange: 40,
      spawnMin: 50,
      gameSpeed: 2,
    };
  }

  const gameStateRef = useRef(initializeGame());
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        color,
      });
    }
  };

  const handleGameOver = useCallback(() => {
    setFinalScore(gameStateRef.current.score);
    setIsGameOver(true);
    createParticles(
      gameStateRef.current.bird.x + 25,
      gameStateRef.current.bird.y + 25,
      flappyPalette.pink,
      20
    );
  }, []);

  const startGame = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log("Autoplay blocked until user interaction:", err);
      });
    }
    setGameStarted(true);
    setIsPaused(false);
    gameStateRef.current = initializeGame();
    setIsGameOver(false);
    setFinalScore(0);
    lastTimeRef.current = 0; // Reset delta time tracking
  }, []);

  const togglePause = useCallback(() => {
    if (gameStarted && !isGameOver) {
      setIsPaused((prev) => {
        const newState = !prev;
        if (newState === false) {
          lastTimeRef.current = 0; // Reset delta time when resuming
        }
        return newState;
      });
    }
  }, [gameStarted, isGameOver]);

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    startGame();
    // Reset delta time when restarting from game over
    lastTimeRef.current = 0;
  }, [startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create oscillator-based jump sound
    const createJumpSound = () => {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === "suspended") void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Create oscillator-based score sound
    const createScoreSound = () => {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === "suspended") void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    };

    canvas.width = 400;
    canvas.height = 600;

    const fontFamily = getComputedStyle(canvas).fontFamily;

    function drawDonut() {
      if (!ctx) return;
      const { bird, shield } = gameStateRef.current;
      ctx.save();
      ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
      ctx.rotate((bird.rotation * Math.PI) / 180);
      if (shield) {
        ctx.strokeStyle = flappyPalette.lavender;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();
      }
      const image = donutImageRef.current;
      if (image?.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
      }
      ctx.restore();
    }

    function drawFrozenScene() {
      if (!ctx || !canvas) return;
      const game = gameStateRef.current;
      for (const pipe of game.pipes) {
        drawFlappyPipe(ctx, pipe.x, pipe.topHeight, pipe.gap || game.pipeGap, game.pipeWidth, canvas.height);
      }
      for (const powerUp of game.powerUps) {
        if (powerUp.active) drawFlappyPowerUp(ctx, powerUp.x, powerUp.y, powerUp.type);
      }
      drawDonut();
    }

    function gameLoop() {
      if (!canvas || !ctx) return;

      // Calculate delta time for frame-rate independent movement
      const currentTime = performance.now();
      const deltaTime = lastTimeRef.current > 0
        ? (currentTime - lastTimeRef.current) / 1000 // Convert to seconds
        : 1 / 60;
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent physics glitches (e.g., after pause/tab switch)
      // Max 3 frames worth of time to prevent tunneling through objects
      const cappedDeltaTime = Math.min(deltaTime, 3 / 60);

      // Normalize to 60 FPS (multiply by 60 so values work same as before at 60fps)
      const dt = cappedDeltaTime * 60;

      const game = gameStateRef.current;

      drawFlappyBackground(ctx, canvas.width, canvas.height, game.frame);

      if (!gameStarted || isPaused) {
        if (gameStarted) drawFrozenScene();
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (isGameOver) {
        drawFrozenScene();
        // Draw particles
        game.particles = game.particles.filter((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.2 * dt;
          p.life -= 0.02 * dt;

          if (p.life > 0) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            ctx.restore();
            return true;
          }
          return false;
        });

        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      game.frame += dt;

      // Update game speed based on score
      const speedMultiplier = game.slowMotion ? 0.5 : 1;
      game.gameSpeed = Math.min(2 + game.score * 0.1, 5) * speedMultiplier;

      // Update bird physics with rotation
      game.bird.velocity += game.bird.gravity * dt;
      game.bird.y += game.bird.velocity * speedMultiplier * dt;
      game.bird.rotation = Math.min(Math.max(game.bird.velocity * 3, -30), 30);

      // Update power-up timer
      if (game.powerUpTimer > 0) {
        game.powerUpTimer -= dt;
        if (game.powerUpTimer <= 0) {
          game.powerUpTimer = 0;
          game.slowMotion = false;
          game.shield = false;
        }
      }

      // Pipe spawning with occasional power-ups and dynamic gaps
      game.spawnTimer -= dt;
      if (game.spawnTimer <= 0) {
        // Calculate dynamic gap based on score
        // At score 0: gap between 160-190
        // At score 30+: gap approaches 140-150
        const maxGap = Math.max(190 - Math.floor(game.score / 3) * 5, 150);
        const minGap = Math.max(140 - Math.floor(game.score / 5) * 2, 130);
        const currentGap = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;

        const minHeight = 80;
        const maxHeight = canvas.height - currentGap - 80;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        game.pipes.push({ x: canvas.width, topHeight, passed: false, gap: currentGap });

        // Spawn power-up occasionally
        if (Math.random() < 0.1) {
          const powerUpY = topHeight + currentGap / 2 - 15;
          game.powerUps.push({
            x: canvas.width + 100,
            y: powerUpY,
            type: Math.random() < 0.5 ? "slowmo" : "shield",
            active: true,
          });
        }

        // Adjust difficulty
        const difficultyFactor = Math.floor(game.score / 5);
        let nextBase = game.spawnBase - difficultyFactor * 5;
        if (nextBase < game.spawnMin) {
          nextBase = game.spawnMin;
        }
        const randomOffset = Math.floor(Math.random() * game.spawnRange);
        game.spawnTimer = nextBase + randomOffset;
      }

      // Update and draw pipes
      for (let i = 0; i < game.pipes.length; i++) {
        const pipe = game.pipes[i];
        pipe.x -= game.gameSpeed * dt;

        const pipeGap = pipe.gap || game.pipeGap;
        drawFlappyPipe(ctx, pipe.x, pipe.topHeight, pipeGap, game.pipeWidth, canvas.height);

        // Collision detection
        const birdBox = {
          left: game.bird.x + 5,
          right: game.bird.x + game.bird.width - 5,
          top: game.bird.y + 5,
          bottom: game.bird.y + game.bird.height - 5,
        };

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + game.pipeWidth;

        if (birdBox.right > pipeLeft && birdBox.left < pipeRight) {
          const gapTop = pipe.topHeight;
          const gapBottom = pipe.topHeight + pipeGap;

          if (!game.shield && (birdBox.top < gapTop || birdBox.bottom > gapBottom)) {
            handleGameOver();
            return;
          }
        }

        // Scoring
        if (!pipe.passed && pipe.x + game.pipeWidth < game.bird.x) {
          game.score++;
          pipe.passed = true;
          createParticles(game.bird.x + 25, game.bird.y + 25, flappyPalette.yellow, 15);

          // Play score sound using Web Audio API
          try {
            createScoreSound();
          } catch (e) {
            console.log("Audio not supported");
          }
        }

        // Remove off-screen pipes
        if (pipe.x + game.pipeWidth < -50) {
          game.pipes.splice(i, 1);
          i--;
        }
      }

      // Update and draw power-ups
      for (let i = game.powerUps.length - 1; i >= 0; i--) {
        const powerUp = game.powerUps[i];
        if (!powerUp.active) continue;

        powerUp.x -= game.gameSpeed * dt;

        drawFlappyPowerUp(ctx, powerUp.x, powerUp.y, powerUp.type);

        // Check collection
        const birdCenterX = game.bird.x + game.bird.width / 2;
        const birdCenterY = game.bird.y + game.bird.height / 2;
        const dist = Math.sqrt(
          Math.pow(birdCenterX - (powerUp.x + 15), 2) +
          Math.pow(birdCenterY - (powerUp.y + 15), 2)
        );

        if (dist < 30) {
          powerUp.active = false;
          game.powerUpTimer = 300; // 5 seconds at 60fps

          if (powerUp.type === "slowmo") {
            game.slowMotion = true;
            createParticles(powerUp.x + 15, powerUp.y + 15, flappyPalette.teal, 10);
          } else {
            game.shield = true;
            createParticles(powerUp.x + 15, powerUp.y + 15, flappyPalette.lavender, 10);
          }

          game.powerUps.splice(i, 1);
        } else if (powerUp.x < -30) {
          game.powerUps.splice(i, 1);
        }
      }

      drawDonut();

      // Update and draw particles
      game.particles = game.particles.filter((p) => {
        p.x += p.vx * speedMultiplier * dt;
        p.y += p.vy * speedMultiplier * dt;
        p.vy += 0.2 * dt;
        p.life -= 0.02 * dt;

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
          ctx.restore();
          return true;
        }
        return false;
      });

      // Ground or ceiling collision
      if (!game.shield && (
        game.bird.y + game.bird.height > canvas.height ||
        game.bird.y < 0
      )) {
        handleGameOver();
        return;
      }

      // Keep the score legible against the illustrated sky.
      ctx.fillStyle = flappyPalette.paper;
      ctx.strokeStyle = flappyPalette.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(14, 14, 135, 40, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = flappyPalette.ink;
      ctx.font = `700 18px ${fontFamily}`;
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${game.score}`, 26, 40);

      if (game.powerUpTimer > 0) {
        const powerUpText = game.slowMotion ? "Slow motion" : "Shield";
        ctx.fillStyle = flappyPalette.paper;
        ctx.beginPath();
        ctx.roundRect(165, 14, 221, 40, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = game.slowMotion ? flappyPalette.teal : flappyPalette.lavender;
        ctx.font = `700 14px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.fillText(`${powerUpText}: ${Math.ceil(game.powerUpTimer / 60)}s`, 275, 39);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    function jump() {
      if (!gameStarted || isGameOver || isPaused) return;

      gameStateRef.current.bird.velocity = gameStateRef.current.bird.jump;
      createParticles(
        gameStateRef.current.bird.x + 10,
        gameStateRef.current.bird.y + gameStateRef.current.bird.height - 10,
        flappyPalette.paper,
        5
      );

      // Play jump sound using Web Audio API
      try {
        createJumpSound();
      } catch (e) {
        console.log("Audio not supported");
      }
    }

    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("a, input, textarea, select")) return;
      if (e.repeat) return;
      if (e.code === "Space") {
        if (e.target instanceof HTMLElement && e.target.closest("button")) return;
        e.preventDefault();
        if (!gameStarted) {
          startGame();
        } else if (isGameOver) {
          handleRestart();
        } else {
          jump();
        }
      } else if (e.key === "p" || e.key === "P") {
        togglePause();
      }
    };

    const handleClick = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return;
      e.preventDefault();

      if (!gameStarted) {
        startGame();
      } else if (isGameOver) {
        handleRestart();
      } else if (!isPaused) {
        jump();
      }
    };

    const preventContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("pointerdown", handleClick);
    canvas.addEventListener("contextmenu", preventContextMenu);

    // Start game loop
    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", handleClick);
      canvas.removeEventListener("contextmenu", preventContextMenu);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, isGameOver, isPaused, handleGameOver, startGame, togglePause, finalScore, highScore, handleRestart]);

  return (
    <div className={styles.game}>
      <div ref={donutArtRef} className={styles.sprite} aria-hidden="true">
        <DonutArt />
      </div>
      <div className={styles.toolbar}>
        <p className={styles.best}>Personal best <strong>{highScore}</strong></p>
        {gameStarted && !isGameOver && (
          <button onClick={togglePause} className={styles.pauseButton} aria-label={isPaused ? "Resume game" : "Pause game"}>
            {isPaused ? "Resume" : "Pause"} <span aria-hidden="true"> / P</span>
          </button>
        )}
      </div>
      <div className={styles.stage}>
        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className={styles.canvas}
          aria-label="Flappy Donut play area. Tap, click, or press Space to flap. Press P to pause."
        >
          Flappy Donut requires a browser that supports canvas.
        </canvas>
        {(!gameStarted || isPaused || isGameOver) && (
          <div className={styles.overlay}>
            <div className={styles.panel} data-state={isGameOver ? "over" : isPaused ? "paused" : "ready"} aria-live="polite">
              <DonutArt className={styles.mascot} />
              <p className={styles.eyebrow}>Sunday Night Games / Arcade</p>
              <h2>{isGameOver ? "One more try?" : isPaused ? "Taking a breather." : "Stay sweet. Stay airborne."}</h2>
              {isGameOver ? (
                <>
                  <p className={styles.score} aria-label={`Final score: ${finalScore}`}>{finalScore}</p>
                  {finalScore === highScore && finalScore > 0 && <p className={styles.record}>New personal best!</p>}
                  <p className={styles.copy}>Pipes cleared. Ready for another round?</p>
                </>
              ) : (
                <p className={styles.copy}>
                  {isPaused ? "Your donut will be right here." : "Tap to flap. Find the gaps. Keep flying."}
                </p>
              )}
              <button className={styles.playButton} onClick={isGameOver ? handleRestart : isPaused ? togglePause : startGame}>
                {isGameOver ? "Play again" : isPaused ? "Keep flying" : "Let's play"}
              </button>
              <p className={styles.hint}>{isPaused ? "or press P to resume" : "or press Space"}</p>
            </div>
          </div>
        )}
      </div>
      <div className={styles.controls}>
        <p>Tap or click to flap / <kbd>Space</kbd> flap / <kbd>P</kbd> pause</p>
        <div className={styles.powerUps}>
          <span>
            <svg viewBox="0 0 32 32" fill="#f9dd93" stroke="#252623" strokeWidth="2" aria-hidden="true">
              <circle cx="16" cy="16" r="14" /><circle cx="16" cy="16" r="8" fill="none" /><path d="M16 11v5l4 2" fill="none" />
            </svg>
            Clock = slow motion
          </span>
          <span>
            <svg viewBox="0 0 32 32" fill="#d9cfed" stroke="#252623" strokeWidth="2" aria-hidden="true">
              <circle cx="16" cy="16" r="14" /><path d="m16 7 8 4-2 9q-3 4-6 6-3-2-6-6l-2-9z" fill="none" />
            </svg>
            Shield = protection
          </span>
        </div>
      </div>
      <audio ref={audioRef} src="/8_Bit_Adventure.mp3" loop style={{ display: "none" }} />
    </div>
  );
}
