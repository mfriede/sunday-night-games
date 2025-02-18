'use client';

import { useEffect, useRef, useState } from "react";
import styles from "./DonutGame.module.css";

const DonutGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const donutImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Load donut sprite
    const donutImage = new Image();
    donutImage.src = '/images/donut_sprite.png';
    donutImage.onload = () => {
      donutImageRef.current = donutImage;
      setImageLoaded(true);
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

    // Generate initial platforms
    const platforms = [
      { x: 0, y: canvas.height - 20, width: canvas.width * 100, height: 20 }, // Infinite floor
      { x: 50, y: canvas.height - 100, width: 200, height: 20 }, // First platform (easier to reach)
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

    const collectibles = [
      { x: 200, y: 150, size: 10 },
      { x: 350, y: 90, size: 10 },
      { x: 600, y: 130, size: 10 },
    ];

    let score = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && !donut.isJumping) {
        donut.velocityY = -10;
        donut.isJumping = true;
      }
      if (e.key === "ArrowLeft") {
        donut.velocityX = -speed;
      }
      if (e.key === "ArrowRight") {
        donut.velocityX = speed;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
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

      // Add more platforms as needed
      addPlatformsIfNeeded();

      // Apply gravity and update position
      donut.velocityY += gravity;
      donut.x += donut.velocityX;
      donut.y += donut.velocityY;

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
      ctx.fillStyle = "yellow";
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
      {!gameRunning && imageLoaded && (
        <button onClick={() => setGameRunning(true)}>Start Game</button>
      )}
      {!imageLoaded && <div>Loading...</div>}
    </div>
  );
};

export default DonutGame;
