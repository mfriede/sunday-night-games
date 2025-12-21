"use client";
import { useEffect, useRef, useState, useCallback } from "react";

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
  const jumpSoundRef = useRef<HTMLAudioElement | null>(null);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flappy-donut-high-score");
    if (saved) setHighScore(parseInt(saved));
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
      }[],
      frame: 0,
      pipeGap: 140,
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
      "#ff0000",
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
  }, []);

  const togglePause = useCallback(() => {
    if (gameStarted && !isGameOver) {
      setIsPaused((prev) => !prev);
    }
  }, [gameStarted, isGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Assets
    const donutImg = new Image();
    donutImg.src = "/donut.png";
    const bgImg = new Image();
    bgImg.src = "/bakery_background.png";
    const pipeImg = new Image();
    pipeImg.src = "/pipe.png";

    // Sound effects
    if (!jumpSoundRef.current) {
      jumpSoundRef.current = new Audio();
      jumpSoundRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      jumpSoundRef.current.volume = 0.3;
    }

    if (!scoreSoundRef.current) {
      scoreSoundRef.current = new Audio();
      scoreSoundRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
      scoreSoundRef.current.volume = 0.5;
    }

    canvas.width = 400;
    canvas.height = 600;

    function gameLoop() {
      if (!canvas || !ctx) return;

      const game = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = "rgba(135, 206, 235, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!gameStarted) {
        // Start screen
        ctx.fillStyle = "#333";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Flappy Donut", canvas.width / 2, 200);

        ctx.font = "20px Arial";
        ctx.fillText("Click or Press Space to Start", canvas.width / 2, 250);
        ctx.fillText("Press P to Pause", canvas.width / 2, 280);

        ctx.font = "16px Arial";
        ctx.fillText("Collect power-ups for special abilities!", canvas.width / 2, 350);

        // Draw donut
        if (donutImg.complete) {
          ctx.drawImage(donutImg, canvas.width / 2 - 25, 150, 50, 50);
        }

        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (isPaused) {
        // Pause screen
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

        ctx.font = "20px Arial";
        ctx.fillText("Press P to Resume", canvas.width / 2, canvas.height / 2 + 40);

        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (isGameOver) {
        // Draw particles
        game.particles = game.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          p.life -= 0.02;

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

        // Game over screen
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, 200);

        ctx.font = "24px Arial";
        ctx.fillText(`Score: ${finalScore}`, canvas.width / 2, 250);

        if (finalScore === highScore && finalScore > 0) {
          ctx.fillStyle = "#FFD700";
          ctx.fillText("NEW HIGH SCORE!", canvas.width / 2, 290);
        }

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 330);

        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      game.frame++;

      // Update game speed based on score
      const speedMultiplier = game.slowMotion ? 0.5 : 1;
      game.gameSpeed = Math.min(2 + game.score * 0.1, 5) * speedMultiplier;

      // Scroll background
      const bgSpeed = 1 * speedMultiplier;
      const bgX = -(game.frame * bgSpeed % canvas.width);
      ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
      ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

      // Update bird physics with rotation
      game.bird.velocity += game.bird.gravity;
      game.bird.y += game.bird.velocity * speedMultiplier;
      game.bird.rotation = Math.min(Math.max(game.bird.velocity * 3, -30), 30);

      // Update power-up timer
      if (game.powerUpTimer > 0) {
        game.powerUpTimer--;
        if (game.powerUpTimer === 0) {
          game.slowMotion = false;
          game.shield = false;
        }
      }

      // Pipe spawning with occasional power-ups
      game.spawnTimer--;
      if (game.spawnTimer <= 0) {
        const minHeight = 80;
        const maxHeight = canvas.height - game.pipeGap - 80;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        game.pipes.push({ x: canvas.width, topHeight, passed: false });

        // Spawn power-up occasionally
        if (Math.random() < 0.1) {
          const powerUpY = topHeight + game.pipeGap / 2 - 15;
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
        pipe.x -= game.gameSpeed;

        // Draw pipes with gradient effect
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + game.pipeWidth, 0);
        gradient.addColorStop(0, "#2ecc71");
        gradient.addColorStop(0.5, "#27ae60");
        gradient.addColorStop(1, "#229954");

        // Top pipe
        ctx.fillStyle = gradient;
        ctx.fillRect(pipe.x, 0, game.pipeWidth, pipe.topHeight);

        // Pipe cap
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, game.pipeWidth + 10, 30);

        // Bottom pipe
        ctx.fillStyle = gradient;
        ctx.fillRect(
          pipe.x,
          pipe.topHeight + game.pipeGap,
          game.pipeWidth,
          canvas.height - pipe.topHeight - game.pipeGap
        );

        // Bottom pipe cap
        ctx.fillStyle = "#27ae60";
        ctx.fillRect(
          pipe.x - 5,
          pipe.topHeight + game.pipeGap,
          game.pipeWidth + 10,
          30
        );

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
          const gapBottom = pipe.topHeight + game.pipeGap;

          if (!game.shield && (birdBox.top < gapTop || birdBox.bottom > gapBottom)) {
            handleGameOver();
            return;
          }
        }

        // Scoring
        if (!pipe.passed && pipe.x + game.pipeWidth < game.bird.x) {
          game.score++;
          pipe.passed = true;
          createParticles(game.bird.x + 25, game.bird.y + 25, "#FFD700", 15);

          // Play score sound
          if (scoreSoundRef.current) {
            scoreSoundRef.current.currentTime = 0;
            scoreSoundRef.current.play().catch(() => {});
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

        powerUp.x -= game.gameSpeed;

        // Draw power-up
        ctx.save();
        ctx.translate(powerUp.x + 15, powerUp.y + 15);
        ctx.rotate(game.frame * 0.05);

        if (powerUp.type === "slowmo") {
          ctx.fillStyle = "#3498db";
          ctx.font = "20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("⏱", 0, 0);
        } else {
          ctx.fillStyle = "#9b59b6";
          ctx.font = "20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🛡", 0, 0);
        }
        ctx.restore();

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
            createParticles(powerUp.x + 15, powerUp.y + 15, "#3498db", 10);
          } else {
            game.shield = true;
            createParticles(powerUp.x + 15, powerUp.y + 15, "#9b59b6", 10);
          }

          game.powerUps.splice(i, 1);
        } else if (powerUp.x < -30) {
          game.powerUps.splice(i, 1);
        }
      }

      // Draw donut with rotation
      ctx.save();
      ctx.translate(game.bird.x + game.bird.width / 2, game.bird.y + game.bird.height / 2);
      ctx.rotate((game.bird.rotation * Math.PI) / 180);

      if (game.shield) {
        // Draw shield
        ctx.strokeStyle = "rgba(155, 89, 182, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.drawImage(donutImg, -game.bird.width / 2, -game.bird.height / 2, game.bird.width, game.bird.height);
      ctx.restore();

      // Update and draw particles
      game.particles = game.particles.filter((p) => {
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        p.vy += 0.2;
        p.life -= 0.02;

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

      // Draw UI
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "left";
      ctx.strokeText(`Score: ${game.score}`, 10, 40);
      ctx.fillText(`Score: ${game.score}`, 10, 40);

      // Draw power-up status
      if (game.powerUpTimer > 0) {
        const powerUpText = game.slowMotion ? "SLOW MOTION" : "SHIELD";
        const powerUpColor = game.slowMotion ? "#3498db" : "#9b59b6";

        ctx.fillStyle = powerUpColor;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${powerUpText}: ${Math.ceil(game.powerUpTimer / 60)}s`, canvas.width / 2, 30);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    function jump() {
      if (!gameStarted || isGameOver || isPaused) return;

      gameStateRef.current.bird.velocity = gameStateRef.current.bird.jump;
      createParticles(
        gameStateRef.current.bird.x + 10,
        gameStateRef.current.bird.y + gameStateRef.current.bird.height - 10,
        "#87CEEB",
        5
      );

      // Play jump sound
      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0;
        jumpSoundRef.current.play().catch(() => {});
      }
    }

    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!gameStarted) {
          startGame();
        } else {
          jump();
        }
      } else if (e.key === "p" || e.key === "P") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", () => {
      if (!gameStarted) {
        startGame();
      } else {
        jump();
      }
    });

    // Start game loop
    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", jump);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, isGameOver, isPaused, handleGameOver, startGame, togglePause, finalScore, highScore]);

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    startGame();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-4 border-gray-700 rounded-lg shadow-2xl"
        />

        {gameStarted && !isGameOver && (
          <button
            onClick={togglePause}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded hover:bg-opacity-70 transition-all"
          >
            {isPaused ? "Resume (P)" : "Pause (P)"}
          </button>
        )}
      </div>

      <div className="mt-4 text-white text-center">
        <p className="text-lg font-semibold">High Score: {highScore}</p>
        <p className="text-sm text-gray-400 mt-2">
          Use SPACE or click to jump • P to pause
        </p>
      </div>

      {/* Hidden audio elements */}
      <audio
        ref={audioRef}
        src="/8_Bit_Adventure.mp3"
        loop
        style={{ display: "none" }}
      />
    </div>
  );
}