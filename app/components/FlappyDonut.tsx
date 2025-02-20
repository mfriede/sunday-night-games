"use client";
import { useEffect, useRef, useState } from "react";

export default function FlappyDonut() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // We'll still render an <audio> element in JSX so we can manage it via ref, but no controls.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // React states
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Initialize local game state
  function initializeGame() {
    return {
      bird: {
        x: 50,
        y: 150,
        width: 50,
        height: 50,
        velocity: 0,
        gravity: 0.2,
        jump: -6,
      },
      pipes: [] as {
        x: number;
        topHeight: number;
        passed: boolean;
      }[],
      frame: 0,
      pipeGap: 150,
      score: 0,

      pipeWidth: 50,
      spawnTimer: 80,
      spawnBase: 100,
      spawnRange: 40,
      spawnMin: 40,
    };
  }

  const gameStateRef = useRef(initializeGame());

  function handleGameOver() {
    setFinalScore(gameStateRef.current.score);
    setIsGameOver(true);
  }

  useEffect(() => {
    // Audio setup: loop the track and set volume, but we won't show any controls.
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

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

    let animationFrameId: number;

    function startGame() {
      // Attempt to play audio. If autoplay is blocked, 
      // audio will begin after the next user interaction (click or space).
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Autoplay blocked until user interaction:", err);
        });
      }
      gameLoop();
    }

    // Preload images before starting the game loop
    Promise.all([
      new Promise<void>((resolve) => {
        donutImg.onload = () => resolve();
      }),
      new Promise<void>((resolve) => {
        bgImg.onload = () => resolve();
      }),
      new Promise<void>((resolve) => {
        pipeImg.onload = () => resolve();
      }),
    ]).then(() => {
      canvas.width = 400;
      canvas.height = 600;
      startGame();
    });

    function gameLoop() {
      if (!canvas || !ctx) return;

      const game = gameStateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If game is over, pause audio and draw end screen
      if (isGameOver) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        ctx.font = "30px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("Game Over", 120, 150);
        ctx.fillText(`Score: ${finalScore}`, 150, 200);
        return;
      }

      game.frame++;

      // Scroll background
      const bgX = -(game.frame % canvas.width);
      ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
      ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

      // Bird physics
      game.bird.velocity += game.bird.gravity;
      game.bird.y += game.bird.velocity;

      // Draw bird
      ctx.drawImage(
        donutImg,
        game.bird.x,
        game.bird.y,
        game.bird.width,
        game.bird.height
      );

      // Pipe spawning
      game.spawnTimer--;
      if (game.spawnTimer <= 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - game.pipeGap - 50;
        const topHeight =
          Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

        game.pipes.push({ x: canvas.width, topHeight, passed: false });

        // Adjust spawn timer for difficulty
        const difficultyFactor = game.score * 2;
        let nextBase = game.spawnBase - difficultyFactor;
        if (nextBase < game.spawnMin) {
          nextBase = game.spawnMin;
        }
        const randomOffset = Math.floor(Math.random() * game.spawnRange);
        game.spawnTimer = nextBase + randomOffset;
      }

      // Update & draw pipes
      for (let i = 0; i < game.pipes.length; i++) {
        const pipe = game.pipes[i];
        pipe.x -= 2;

        // TOP PIPE (inverted)
        ctx.save();
        ctx.translate(pipe.x + game.pipeWidth / 2, pipe.topHeight);
        ctx.scale(1, -1);
        ctx.drawImage(
          pipeImg,
          -game.pipeWidth / 2,
          0,
          game.pipeWidth,
          pipe.topHeight
        );
        ctx.restore();

        // BOTTOM PIPE (normal)
        const bottomPipeHeight = 600 - (pipe.topHeight + game.pipeGap);
        ctx.drawImage(
          pipeImg,
          pipe.x,
          pipe.topHeight + game.pipeGap,
          game.pipeWidth,
          bottomPipeHeight
        );

        // Bird bounding box
        const hitboxPadding = 10;
        const birdLeft = game.bird.x + hitboxPadding;
        const birdRight = game.bird.x + game.bird.width - hitboxPadding;
        const birdTop = game.bird.y + hitboxPadding;
        const birdBottom = game.bird.y + game.bird.height - hitboxPadding;

        // Pipe bounding box
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + game.pipeWidth;

        // Check collision
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          const gapTop = pipe.topHeight;
          const gapBottom = pipe.topHeight + game.pipeGap;
          const inGap = birdBottom >= gapTop && birdTop <= gapBottom;
          if (!inGap) {
            handleGameOver();
            break;
          }
        }

        // Score increment
        if (!pipe.passed && pipe.x + game.pipeWidth < game.bird.x) {
          game.score++;
          pipe.passed = true;
        }

        // Remove off-screen pipes
        if (pipe.x + game.pipeWidth < 0) {
          game.pipes.splice(i, 1);
          i--;
        }
      }

      // Ground or ceiling collision
      if (
        game.bird.y + game.bird.height > canvas.height ||
        game.bird.y < 0
      ) {
        handleGameOver();
      }

      // Draw current score
      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(`Score: ${game.score}`, 10, 30);

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    function jump() {
      if (!isGameOver) {
        gameStateRef.current.bird.velocity = gameStateRef.current.bird.jump;
      }
    }

    // Listeners
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") jump();
    });
    canvas.addEventListener("click", jump);

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.removeEventListener("keydown", jump);
      canvas.removeEventListener("click", jump);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameOver, finalScore]);

  // Restart button handler
  const handleRestart = () => {
    gameStateRef.current = initializeGame();
    setIsGameOver(false);
    setFinalScore(0);

    // The game restarts, so play from the beginning
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Autoplay blocked until user interaction:", err);
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* Hidden audio element: no controls */}
      <audio
        ref={audioRef}
        src="/8_Bit_Adventure.mp3"
        style={{ display: "none" }}
      />

      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />

      {isGameOver && (
        <button
          onClick={handleRestart}
          className="absolute bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          style={{ top: "250px", left: "50%", transform: "translateX(-50%)" }}
        >
          Restart
        </button>
      )}
    </div>
  );
}
