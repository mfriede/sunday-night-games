'use client';

import { useEffect, useRef, useState } from "react";
import styles from "./DonutGame.module.css";

const DonutGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const donutImageRef = useRef<HTMLImageElement | null>(null);
  const gameOverImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [gameOverImageLoaded, setGameOverImageLoaded] = useState(false);

  const restartGame = () => {
    setGameOver(false);
    setGameRunning(true);
    setFinalScore(0);
  };

  useEffect(() => {
    // Load donut sprite
    const donutImage = new Image();
    donutImage.src = '/images/donut_sprite.png';
    donutImage.onload = () => {
      donutImageRef.current = donutImage;
      setImageLoaded(true);
    };

    // Load game over image
    const gameOverImage = new Image();
    gameOverImage.src = '/images/donut_survivor_.jpg';
    gameOverImage.onload = () => {
      gameOverImageRef.current = gameOverImage;
      setGameOverImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!imageLoaded || !donutImageRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game settings
    const gravity = 0.5;
    const speed = 5;
    const maxJumpHeight = 150; // Maximum height the donut can jump
    let scrollOffset = 0;
    
    const donut = {
      x: 50,
      y: 200,
      width: 64,
      height: 64,
      velocityY: 0,
      velocityX: 0,
      isJumping: false,
    };

    // Platform generation settings
    const platformWidth = 100;
    const minGap = 100;  // Increased minimum horizontal gap
    const maxGap = 200;  // Increased maximum horizontal gap
    const minPlatformHeight = 20;  // Minimum platform height from ground
    const verticalSpacing = 80;    // Minimum vertical space between platforms
    
    const generatePlatform = (lastX: number, lastY: number) => {
      const x = lastX + minGap + Math.random() * (maxGap - minGap);
      
      // Ensure new platform is reachable from previous height
      const maxDropHeight = 120;  // Maximum drop between platforms
      const minY = Math.max(lastY - maxJumpHeight + verticalSpacing, 100); // Higher minimum
      const maxY = Math.min(lastY + maxDropHeight, canvas.height - 100);
      const y = minY + Math.random() * (maxY - minY);
      
      return {
        x,
        y,
        width: platformWidth + Math.random() * 50, // Less width variation
        height: minPlatformHeight
      };
    };

    const generateFloorSegments = (startX: number, length: number) => {
      const segments = [];
      let currentX = startX;
      const segmentWidth = 300; // Width of each floor segment
      const gapWidth = 100;     // Width of gaps
      
      while (currentX < startX + length) {
        // 70% chance to add a floor segment, 30% chance for a gap
        if (Math.random() < 0.7) {
          segments.push({
            x: currentX,
            y: canvas.height - 20,
            width: segmentWidth,
            height: 20
          });
        }
        currentX += segmentWidth + gapWidth;
      }
      return segments;
    };

    // Generate initial platforms including floor segments
    const platforms = [
      ...generateFloorSegments(0, canvas.width * 100),
      { x: 50, y: canvas.height - 100, width: 200, height: 20 }, // First platform
    ];

    // Generate first set of platforms
    let lastPlatform = { x: 50, y: canvas.height - 100 };
    for (let i = 0; i < 20; i++) {
      const platform = generatePlatform(lastPlatform.x, lastPlatform.y);
      platforms.push(platform);
      lastPlatform = platform;
    }

    // Function to add more platforms as player moves right
    const addPlatformsIfNeeded = () => {
      const rightmostPlatform = platforms[platforms.length - 1];
      const visibleRight = scrollOffset + canvas.width;
      
      if (rightmostPlatform.x < visibleRight + 1000) { // Generate ahead of visible area
        const newPlatform = generatePlatform(rightmostPlatform.x, rightmostPlatform.y);
        platforms.push(newPlatform);
      }
    };

    // Add collectible generation settings
    const generateCollectible = (nearPlatform: { x: number, y: number, width: number }) => {
      // Position collectible above the platform
      const x = nearPlatform.x + Math.random() * (nearPlatform.width - 20); // 20 is collectible size
      const y = nearPlatform.y - 50 - Math.random() * 50; // Random height above platform
      
      return {
        x,
        y,
        size: 20
      };
    };

    // Initialize collectibles array
    let collectibles: { x: number; y: number; size: number; }[] = [];

    // Generate collectibles near platforms
    const addCollectiblesIfNeeded = () => {
      const visibleRight = scrollOffset + canvas.width;
      const rightmostCollectible = collectibles.length > 0 
        ? Math.max(...collectibles.map(c => c.x))
        : 0;

      if (rightmostCollectible < visibleRight + 500) {
        // Find platforms that don't have collectibles nearby
        platforms.forEach(platform => {
          if (platform.x > rightmostCollectible && 
              platform.x < visibleRight + 1000 && 
              Math.random() < 0.3) { // 30% chance to add collectible
            collectibles.push(generateCollectible(platform));
          }
        });
      }

      // Remove collectibles that are far behind
      collectibles = collectibles.filter(c => c.x > scrollOffset - 200);
    };

    let score = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "ArrowUp" || e.key === " " || e.key === "w" || e.key === "W") && !donut.isJumping) {
        donut.velocityY = -10;
        donut.isJumping = true;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        donut.velocityX = -speed;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        donut.velocityX = speed;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && donut.velocityX < 0) {
        donut.velocityX = 0;
      }
      if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && donut.velocityX > 0) {
        donut.velocityX = 0;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    const checkPlatformCollisions = () => {
      let onPlatform = false;
      platforms.forEach((platform) => {
        const adjustedX = platform.x - scrollOffset;
        if (
          donut.x + donut.width > adjustedX &&
          donut.x < adjustedX + platform.width &&
          donut.y + donut.height >= platform.y &&
          donut.y + donut.height - donut.velocityY <= platform.y
        ) {
          donut.y = platform.y - donut.height;
          donut.velocityY = 0;
          donut.isJumping = false;
          onPlatform = true;
        }
      });
      return onPlatform;
    };

    const updateGame = () => {
      if (!canvas || !ctx || !donutImageRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // If game is over, draw the game over image
      if (gameOver && gameOverImageRef.current) {
        // Draw the game over image to fit canvas while maintaining aspect ratio
        const img = gameOverImageRef.current;
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Draw score overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
        
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Final Score: ${finalScore}`, canvas.width / 2, canvas.height / 2);
        
        return;
      }

      // Add more platforms and collectibles as needed
      addPlatformsIfNeeded();
      addCollectiblesIfNeeded();

      // Apply gravity and update position
      donut.velocityY += gravity;
      donut.x += donut.velocityX;
      donut.y += donut.velocityY;

      // Check if donut fell off the bottom
      if (donut.y + donut.height > canvas.height) {
        setGameOver(true);
        setFinalScore(score);
        setGameRunning(false);
        return;
      }

      // Scrolling effect
      if (donut.x > canvas.width / 2) {
        scrollOffset += donut.velocityX;
        donut.x = canvas.width / 2;
      }

      // Check platform collisions
      const onPlatform = checkPlatformCollisions();

      // Keep donut within bounds
      if (donut.x < 0) donut.x = 0;
      if (donut.y + donut.height > canvas.height) {
        donut.y = canvas.height - donut.height;
        donut.velocityY = 0;
        donut.isJumping = false;
      }

      // Draw visible platforms
      ctx.fillStyle = "#8B4513";
      platforms.forEach((platform) => {
        // Only draw platforms that are visible
        if (platform.x - scrollOffset < canvas.width && 
            platform.x - scrollOffset + platform.width > 0) {
          ctx.fillRect(platform.x - scrollOffset, platform.y, platform.width, platform.height);
        }
      });

      // Draw donut sprite
      ctx.save();
      if (donut.velocityX < 0) {
        // Flip horizontally if moving left
        ctx.scale(-1, 1);
        ctx.drawImage(
          donutImageRef.current,
          -donut.x - donut.width,
          donut.y,
          donut.width,
          donut.height
        );
      } else {
        ctx.drawImage(
          donutImageRef.current,
          donut.x,
          donut.y,
          donut.width,
          donut.height
        );
      }
      ctx.restore();

      // Draw and check collectibles
      ctx.fillStyle = "white";
      for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        const adjustedX = collectible.x - scrollOffset;
        
        if (
          donut.x < adjustedX + collectible.size &&
          donut.x + donut.width > adjustedX &&
          donut.y < collectible.y + collectible.size &&
          donut.y + donut.height > collectible.y
        ) {
          score += 10;
          collectibles.splice(i, 1);
        } else {
          ctx.fillRect(adjustedX, collectible.y, collectible.size, collectible.size);
        }
      }

      // Draw score
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 10, 20);

      if (gameRunning) {
        gameLoopRef.current = requestAnimationFrame(updateGame);
      }
    };

    if (gameRunning) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameRunning, imageLoaded]);

  return (
    <div className={styles.gameContainer}>
      <canvas ref={canvasRef} width={800} height={400} className={styles.canvas}></canvas>
      
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>Game Over!</h2>
          <p>Final Score: {finalScore}</p>
          <button 
            onClick={restartGame}
            className={styles.button}
          >
            Play Again
          </button>
        </div>
      )}
      
      {!gameRunning && !gameOver && imageLoaded && (
        <button 
          onClick={() => setGameRunning(true)}
          className={styles.button}
        >
          Start Game
        </button>
      )}
      
      {!imageLoaded && <div>Loading...</div>}
    </div>
  );
};

export default DonutGame;
