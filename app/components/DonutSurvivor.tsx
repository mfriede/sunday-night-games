'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { DonutArt } from './ArcadeArt';
import { drawSurvivorBackground, drawSurvivorCoin, drawSurvivorPipe, drawSurvivorPlatform, survivorPalette } from './donutSurvivorArt';
import styles from '../styles/DonutSurvivorGame.module.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'goomba' | 'koopa';
  direction: number;
  alive: boolean;
  velocityY: number;
  isJumping: boolean;
  frame: number;
}

interface QuestionBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  hit: boolean;
  itemType: 'coin' | 'mushroom' | 'star';
  bounceOffset: number;
}

interface Pipe {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'mushroom' | 'star' | 'doublejump' | 'shield';
  collected: boolean;
  velocityX: number;
  velocityY: number;
  spawned: boolean;
  spawnY: number;
}

interface Collectible {
  x: number;
  y: number;
  collected: boolean;
  velocityY: number;
  spawnY: number;
}

export default function DonutSurvivor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const donutArtRef = useRef<HTMLDivElement>(null);
  const soundContextRef = useRef<AudioContext | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('donut-survivor-high-score');
    const savedScore = Number(saved);
    if (Number.isSafeInteger(savedScore) && savedScore >= 0) setHighScore(savedScore);
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('donut-survivor-high-score', score.toString());
    }
  }, [score, highScore]);

  const gameStateRef = useRef({
    donut: {
      x: 100,
      y: 200,
      width: 48,
      height: 48,
      baseWidth: 48,
      baseHeight: 48,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      doubleJumpAvailable: false,
      shieldActive: false,
      shieldTimer: 0,
      starPowerActive: false,
      starPowerTimer: 0,
      isBig: false,
      rotation: 0,
      frame: 0,
      invincible: false,
      invincibleTimer: 0,
    },
    camera: {
      x: 0,
      y: 0,
    },
    platforms: [] as Array<{x: number, y: number, width: number, height: number, type: 'ground' | 'brick' | 'block'}>,
    questionBlocks: [] as QuestionBlock[],
    pipes: [] as Pipe[],
    enemies: [] as Enemy[],
    powerUps: [] as PowerUp[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    gameSpeed: 3,
    distance: 0,
    score: 0,
    coins: 0,
  });

  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const keysPressedLastFrame = useRef<Set<string>>(new Set());
  const donutSpriteRef = useRef<HTMLImageElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Use the same donut illustration as the homepage and Flappy Donut.
  useEffect(() => {
    const svg = donutArtRef.current?.querySelector('svg');
    if (svg) {
      const sprite = svg.cloneNode(true) as SVGSVGElement;
      sprite.setAttribute('width', '220');
      sprite.setAttribute('height', '220');
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(sprite))}`;
      donutSpriteRef.current = image;
    }
    const music = new Audio('/8_Bit_Adventure.mp3');
    music.loop = true;
    music.volume = 0.3;
    backgroundMusicRef.current = music;
    return () => {
      music.pause();
      soundContextRef.current?.close();
      soundContextRef.current = null;
    };
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    const particles = gameStateRef.current.particles;
    const particleColor = color === '#FFD700' ? survivorPalette.gold
      : color === '#FFFFFF' ? survivorPalette.paper
      : color === '#87CEEB' ? survivorPalette.lavender
      : color;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        color: particleColor,
      });
    }
  };

  const createJumpSound = () => {
    try {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const createCollectSound = () => {
    try {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const createPowerUpSound = () => {
    try {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const createStompSound = () => {
    try {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const createBlockHitSound = () => {
    try {
      const audioContext = soundContextRef.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioContext.state === 'suspended') void audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Helper function to find the ground Y position at a given X
  const getGroundYAt = (x: number): number => {
    const game = gameStateRef.current;
    const allPlatforms = [...game.platforms];
    game.pipes.forEach(pipe => {
      allPlatforms.push({
        x: pipe.x,
        y: pipe.y,
        width: pipe.width,
        height: pipe.height,
        type: 'ground',
      });
    });

    // Find the highest platform at this X position
    let groundY = Infinity;
    allPlatforms.forEach(platform => {
      if (x + 20 > platform.x && x < platform.x + platform.width) {
        groundY = Math.min(groundY, platform.y);
      }
    });

    return groundY === Infinity ? 400 : groundY; // Default fallback
  };

  // Helper function to check if a rectangular area is clear of solid objects
  const isPositionClear = (x: number, y: number, width: number, height: number): boolean => {
    const game = gameStateRef.current;

    // Check collision with platforms
    for (const platform of game.platforms) {
      if (
        x < platform.x + platform.width &&
        x + width > platform.x &&
        y < platform.y + platform.height &&
        y + height > platform.y
      ) {
        return false; // Collision with platform
      }
    }

    // Check collision with pipes
    for (const pipe of game.pipes) {
      if (
        x < pipe.x + pipe.width &&
        x + width > pipe.x &&
        y < pipe.y + pipe.height &&
        y + height > pipe.y
      ) {
        return false; // Collision with pipe
      }
    }

    return true; // Position is clear
  };

  const initializeGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = gameStateRef.current;

    // Reset donut
    game.donut = {
      x: 100,
      y: 200,
      width: 48,
      height: 48,
      baseWidth: 48,
      baseHeight: 48,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      doubleJumpAvailable: false,
      shieldActive: false,
      shieldTimer: 0,
      starPowerActive: false,
      starPowerTimer: 0,
      isBig: false,
      rotation: 0,
      frame: 0,
      invincible: false,
      invincibleTimer: 0,
    };

    // Reset camera
    game.camera.x = 0;
    game.camera.y = 0;

    // Generate initial Mario-style level
    game.platforms = [];
    game.questionBlocks = [];
    game.pipes = [];

    const groundY = 350;
    let currentX = 0;

    // Starting safe area
    game.platforms.push({
      x: 0,
      y: groundY,
      width: 400,
      height: 50,
      type: 'ground',
    });
    currentX = 400;

    // Generate level sections
    for (let section = 0; section < 30; section++) {
      const sectionType = Math.random();

      if (sectionType < 0.3) {
        // Ground section with question blocks
        const groundLength = 200 + Math.random() * 200;
        game.platforms.push({
          x: currentX,
          y: groundY,
          width: groundLength,
          height: 50,
          type: 'ground',
        });

        // Add question blocks above
        if (Math.random() < 0.7) {
          const numBlocks = 1 + Math.floor(Math.random() * 3);
          // Snap to 40px grid (blocks are 40px tall)
          // Use rows 1-3 to avoid overlap with bricks (which are at rows 3-5)
          const blockRow = 1 + Math.floor(Math.random() * 3); // 1-3 blocks above ground
          const blockY = groundY - blockRow * 40;
          for (let i = 0; i < numBlocks; i++) {
            game.questionBlocks.push({
              x: currentX + 50 + i * 40, // 40px spacing to align with block width
              y: blockY,
              width: 40,
              height: 40,
              hit: false,
              itemType: Math.random() < 0.3 ? 'mushroom' : Math.random() < 0.5 ? 'star' : 'coin',
              bounceOffset: 0,
            });
          }
        }

        // Add bricks
        if (Math.random() < 0.5) {
          // Snap to 40px grid
          // Start at row 4 to avoid overlap with question blocks (which are at rows 1-3)
          const brickRow = 4 + Math.floor(Math.random() * 3); // 4-6 blocks above ground
          const brickY = groundY - brickRow * 40;
          const numBricks = 2 + Math.floor(Math.random() * 4);
          for (let i = 0; i < numBricks; i++) {
            game.platforms.push({
              x: currentX + 80 + i * 40,
              y: brickY,
              width: 40,
              height: 40,
              type: 'brick',
            });
          }
        }

        currentX += groundLength;
      } else if (sectionType < 0.5) {
        // Pipe section
        const pipeWidth = 60 + Math.random() * 20;
        const pipeHeight = 60 + Math.random() * 80;

        // Ground for pipe
        game.platforms.push({
          x: currentX,
          y: groundY,
          width: 150,
          height: 50,
          type: 'ground',
        });

        game.pipes.push({
          x: currentX + 40,
          y: groundY - pipeHeight,
          width: pipeWidth,
          height: pipeHeight,
        });

        currentX += 150;
      } else if (sectionType < 0.7) {
        // Gap section (Mario-style pit)
        const gapWidth = 80 + Math.random() * 60;
        const platformAfterGap = 150 + Math.random() * 150;

        // Platform before gap
        game.platforms.push({
          x: currentX,
          y: groundY,
          width: 100,
          height: 50,
          type: 'ground',
        });

        currentX += 100 + gapWidth;

        // Platform after gap
        game.platforms.push({
          x: currentX,
          y: groundY,
          width: platformAfterGap,
          height: 50,
          type: 'ground',
        });

        // Add floating platform over gap
        game.platforms.push({
          x: currentX - gapWidth - 20,
          y: groundY - 80, // Fixed height, snap to grid
          width: gapWidth + 40,
          height: 20,
          type: 'brick',
        });

        currentX += platformAfterGap;
      } else {
        // Elevated platforms section
        game.platforms.push({
          x: currentX,
          y: groundY,
          width: 200,
          height: 50,
          type: 'ground',
        });

        // Stairs or elevated platforms - snap to 40px grid
        const numElevated = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numElevated; i++) {
          const row = 1 + i; // Each step higher
          game.platforms.push({
            x: currentX + 50 + i * 40, // 40px spacing
            y: groundY - row * 40,
            width: 40,
            height: 40,
            type: 'brick',
          });
        }

        currentX += 200;
      }
    }

    // Clear other arrays
    game.enemies = [];
    game.powerUps = [];
    game.collectibles = [];
    game.particles = [];

    // Reset game state
    game.gameSpeed = 3;
    game.distance = 0;
    game.score = 0;
    game.coins = 0;

    setScore(0);
    setDistance(0);
    setCoins(0);
  }, []);

  const spawnEnemy = (x: number, y: number, type: 'goomba' | 'koopa') => {
    gameStateRef.current.enemies.push({
      x,
      y,
      width: type === 'goomba' ? 40 : 45,
      height: type === 'goomba' ? 40 : 55,
      speed: type === 'goomba' ? 1.5 : 2,
      type,
      direction: -1,
      alive: true,
      velocityY: 0,
      isJumping: false,
      frame: 0,
    });
  };

  const startGame = useCallback(() => {
    initializeGame();
    keysPressed.current.clear();
    keysPressedLastFrame.current.clear();
    setGameState('playing');
    lastTimeRef.current = 0; // Reset delta time tracking

    // Start background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(err => {
        console.log('Autoplay blocked until user interaction:', err);
      });
    }
  }, [initializeGame]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      keysPressed.current.clear();
      keysPressedLastFrame.current.clear();
      setGameState('paused');
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
      lastTimeRef.current = 0; // Reset delta time when resuming
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.play().catch(err => {
          console.log('Failed to resume music:', err);
        });
      }
    }
  }, [gameState]);

  const gameOver = useCallback(() => {
    setGameState('gameover');
    createParticles(gameStateRef.current.donut.x, gameStateRef.current.donut.y, survivorPalette.pink, 30);

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
  }, []);

  const hurtPlayer = useCallback(() => {
    const donut = gameStateRef.current.donut;

    if (donut.invincible || donut.starPowerActive) return;

    if (donut.isBig) {
      // Shrink down
      donut.isBig = false;
      donut.width = donut.baseWidth;
      donut.height = donut.baseHeight;
      donut.invincible = true;
      donut.invincibleTimer = 120;
      createParticles(donut.x + donut.width / 2, donut.y + donut.height / 2, '#FFD700', 10);
    } else {
      // Game over
      gameOver();
    }
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    const fontFamily = getComputedStyle(canvas).fontFamily;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('a, input, textarea, select')) return;
      if (e.key === 'Escape' && !e.repeat && (gameState === 'playing' || gameState === 'paused')) {
        e.preventDefault();
        togglePause();
        return;
      }
      if (e.key === ' ' && e.target instanceof HTMLElement && e.target.closest('button')) return;
      const key = e.key.toLowerCase();
      if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
      }
      if (key === ' ' && !e.repeat && (gameState === 'menu' || gameState === 'gameover')) {
        startGame();
        return;
      }
      if (gameState === 'playing') keysPressed.current.add(key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    const handleBlur = () => {
      keysPressed.current.clear();
      keysPressedLastFrame.current.clear();
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let enemySpawnTimer = 0;

    const gameLoop = () => {
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

      drawSurvivorBackground(ctx, game.camera.x);
      if (gameState === 'menu') {
        drawSurvivorPlatform(ctx, 0, 350, 800, 50, 'ground');
        drawSurvivorPlatform(ctx, 100, 265, 160, 26, 'brick');
        drawSurvivorPlatform(ctx, 600, 210, 120, 26, 'brick');
        for (const x of [625, 660, 695]) drawSurvivorCoin(ctx, x, 180);
      }

      if (gameState === 'playing') {
        const donut = game.donut;
        const speed = 5 * dt;

        // Handle input
        donut.velocityX = 0;

        if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
          donut.velocityX = -speed / dt;
        }
        if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
          donut.velocityX = speed / dt;
        }

        // Handle jumping
        const jumpKeys = ['arrowup', ' ', 'w'];
        const jumpJustPressed = jumpKeys.some(key =>
          keysPressed.current.has(key) && !keysPressedLastFrame.current.has(key)
        );

        if (jumpJustPressed && !donut.isJumping) {
          const jumpPower = donut.isBig ? -14 : -12;
          donut.velocityY = jumpPower;
          donut.isJumping = true;
          donut.doubleJumpAvailable = true;
          createJumpSound();
          createParticles(donut.x + donut.width / 2, donut.y + donut.height, '#FFFFFF', 5);
        } else if (jumpJustPressed && donut.isJumping && donut.doubleJumpAvailable) {
          donut.velocityY = -10;
          donut.doubleJumpAvailable = false;
          createJumpSound();
          createParticles(donut.x + donut.width / 2, donut.y + donut.height, '#87CEEB', 15);
        }

        // Apply physics
        donut.velocityY += 0.6 * dt; // Gravity
        donut.x += donut.velocityX * dt;
        donut.y += donut.velocityY * dt;

        // Update rotation
        if (!donut.isJumping) {
          donut.rotation += donut.velocityX * 0.05 * dt;
        }

        // Update animation frame
        donut.frame = (donut.frame + 0.15 * dt) % 4;

        // Update camera
        game.camera.x = donut.x - canvas.width / 2;

        // Keep camera from going below 0
        if (game.camera.x < 0) game.camera.x = 0;

        // Update distance and score
        if (donut.x > game.distance) {
          game.distance = donut.x;
          setDistance(Math.floor(donut.x / 10));
          if (Math.floor(donut.x / 100) > game.score) {
            game.score = Math.floor(donut.x / 100);
            setScore(game.score);
          }
        }

        // Update timers
        if (donut.shieldTimer > 0) {
          donut.shieldTimer -= dt;
          if (donut.shieldTimer <= 0) {
            donut.shieldTimer = 0;
            donut.shieldActive = false;
          }
        }
        if (donut.starPowerTimer > 0) {
          donut.starPowerTimer -= dt;
          if (donut.starPowerTimer <= 0) {
            donut.starPowerTimer = 0;
            donut.starPowerActive = false;
          }
        }
        if (donut.invincibleTimer > 0) {
          donut.invincibleTimer -= dt;
          if (donut.invincibleTimer <= 0) {
            donut.invincibleTimer = 0;
            donut.invincible = false;
          }
        }

        // Platform collision
        donut.isJumping = true;

        // Check all platforms (ground, bricks, blocks)
        const allPlatforms = [...game.platforms];
        game.pipes.forEach(pipe => {
          allPlatforms.push({
            x: pipe.x,
            y: pipe.y,
            width: pipe.width,
            height: pipe.height,
            type: 'ground',
          });
        });

        allPlatforms.forEach((platform) => {
          if (
            donut.x < platform.x + platform.width &&
            donut.x + donut.width > platform.x &&
            donut.y < platform.y + platform.height &&
            donut.y + donut.height > platform.y
          ) {
            // Landing on top
            if (donut.velocityY > 0 && donut.y + donut.height - donut.velocityY <= platform.y + 5) {
              donut.y = platform.y - donut.height;
              donut.velocityY = 0;
              donut.isJumping = false;
              donut.doubleJumpAvailable = true;
            }
            // Hitting from below
            else if (donut.velocityY < 0 && donut.y - donut.velocityY >= platform.y + platform.height - 5) {
              donut.y = platform.y + platform.height;
              donut.velocityY = 0;
            }
            // Hitting from sides
            else if (donut.velocityX !== 0) {
              if (donut.velocityX > 0) {
                donut.x = platform.x - donut.width;
              } else {
                donut.x = platform.x + platform.width;
              }
              donut.velocityX = 0;
            }
          }
        });

        // Update question block bounce
        game.questionBlocks.forEach(block => {
          if (block.bounceOffset < 0) {
            block.bounceOffset += 2 * dt;
          }
        });

        // Question block collision detection (separate from platforms)
        game.questionBlocks.forEach(block => {
          // Check if player is colliding with the block
          const playerCenterX = donut.x + donut.width / 2;
          const blockCenterX = block.x + block.width / 2;
          const playerTop = donut.y;
          const blockBottom = block.y + block.height;

          // Horizontal overlap check
          const horizontalOverlap = playerCenterX > block.x && playerCenterX < block.x + block.width;

          // Vertical check: player's head is near/at the bottom of the block
          // Dynamic tolerance based on donut height to account for big donut
          const hitTolerance = 30 + (donut.height - donut.baseHeight); // ~30px normal, ~54px big
          const verticalHit = playerTop <= blockBottom && playerTop >= blockBottom - hitTolerance;

          // Must be moving upward
          const movingUp = donut.velocityY < 0;

          if (!block.hit && horizontalOverlap && verticalHit && movingUp) {
            // Player hit the block from below!
            block.hit = true;
            block.bounceOffset = -10;
            createBlockHitSound();

            // Spawn item based on type
            if (block.itemType === 'coin') {
              game.coins++;
              game.score += 50;
              setCoins(game.coins);
              setScore(game.score);
              createCollectSound();
              createParticles(block.x + block.width / 2, block.y, '#FFD700', 10);
            } else if (block.itemType === 'mushroom') {
              game.powerUps.push({
                x: block.x,
                y: block.y - 40,
                type: 'mushroom',
                collected: false,
                velocityX: 2,
                velocityY: 0,
                spawned: false,
                spawnY: block.y - 40,
              });
              createParticles(block.x + block.width / 2, block.y, '#FF0000', 10);
            } else if (block.itemType === 'star') {
              game.powerUps.push({
                x: block.x,
                y: block.y - 40,
                type: 'star',
                collected: false,
                velocityX: 2,
                velocityY: 0,
                spawned: false,
                spawnY: block.y - 40,
              });
              createParticles(block.x + block.width / 2, block.y, '#FFD700', 15);
            }
          }
        });

        // Check if fallen
        if (donut.y > canvas.height + 100) {
          gameOver();
        }

        // Spawn enemies periodically
        enemySpawnTimer += dt;
        if (enemySpawnTimer > 180 && Math.random() < 0.02 * dt) {
          const spawnX = game.camera.x + canvas.width + 50;
          const groundPlatform = game.platforms.find(p =>
            p.x < spawnX && p.x + p.width > spawnX && p.type === 'ground'
          );
          if (groundPlatform) {
            const enemyType = Math.random() < 0.7 ? 'goomba' : 'koopa';
            spawnEnemy(spawnX, groundPlatform.y - 50, enemyType);
            enemySpawnTimer = 0;
          }
        }

        // Update enemies
        game.enemies = game.enemies.filter(enemy => {
          if (!enemy.alive) return false;

          // Apply gravity to enemies
          enemy.velocityY += 0.5 * dt;
          enemy.y += enemy.velocityY * dt;
          enemy.x += enemy.speed * enemy.direction * dt;

          // Enemy platform collision
          allPlatforms.forEach(platform => {
            if (
              enemy.x < platform.x + platform.width &&
              enemy.x + enemy.width > platform.x &&
              enemy.y < platform.y + platform.height &&
              enemy.y + enemy.height > platform.y
            ) {
              if (enemy.velocityY > 0) {
                enemy.y = platform.y - enemy.height;
                enemy.velocityY = 0;
                enemy.isJumping = false;
              }
            }
          });

          // Enemy direction change at edges or when hitting obstacles
          if (enemy.x < game.camera.x - 100 || enemy.x > game.camera.x + canvas.width + 200) {
            return false;
          }

          // Change direction randomly or at edges
          if (Math.random() < 0.01 * dt) {
            enemy.direction *= -1;
          }

          // Update animation
          enemy.frame = (enemy.frame + 0.1 * dt) % 2;

          // Check collision with player
          if (
            donut.x < enemy.x + enemy.width &&
            donut.x + donut.width > enemy.x &&
            donut.y < enemy.y + enemy.height &&
            donut.y + donut.height > enemy.y
          ) {
            // Check if stomping (landing on top)
            const stompThreshold = donut.velocityY > 0 && donut.y + donut.height - donut.velocityY < enemy.y + enemy.height / 2;

            if (stompThreshold && !enemy.isJumping) {
              // Stomp the enemy
              enemy.alive = false;
              donut.velocityY = -8; // Bounce up
              game.score += 100;
              setScore(game.score);
              createStompSound();
              createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === 'goomba' ? '#8B4513' : '#228B22', 15);

              // Chance to drop coin
              if (Math.random() < 0.3) {
                const coinX = enemy.x + enemy.width / 2 - 10;
                const groundY = getGroundYAt(coinX);
                let coinSpawnY = groundY - 30; // Bounce above ground (coin is ~20px tall)

                // Check if spawn position is inside a solid object (coin is 20x20)
                const coinSize = 20;
                if (!isPositionClear(coinX, coinSpawnY, coinSize, coinSize)) {
                  // Try spawning above the enemy instead
                  coinSpawnY = enemy.y - 40;
                  // If still not clear, skip spawning this coin
                  if (!isPositionClear(coinX, coinSpawnY, coinSize, coinSize)) {
                    coinSpawnY = -1; // Invalid position, will be filtered out
                  }
                }

                if (coinSpawnY > 0) {
                  game.collectibles.push({
                    x: coinX,
                    y: enemy.y,
                    collected: false,
                    velocityY: -5,
                    spawnY: coinSpawnY,
                  });
                }
              }
            } else if (!donut.starPowerActive) {
              hurtPlayer();
            } else if (donut.starPowerActive) {
              // Star power kills enemies on contact
              enemy.alive = false;
              game.score += 100;
              setScore(game.score);
              createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FFD700', 20);
            }
          }

          return enemy.alive;
        });

        // Update power-ups
        game.powerUps = game.powerUps.filter(powerUp => {
          if (powerUp.collected) return false;
          if (powerUp.x < game.camera.x - 100) return false;

          // Spawn animation
          if (!powerUp.spawned) {
            powerUp.y = powerUp.spawnY + powerUp.y;
            if (powerUp.y <= powerUp.spawnY) {
              powerUp.spawned = true;
            }
          }

          // Apply physics for moving power-ups
          if (powerUp.spawned && (powerUp.type === 'mushroom' || powerUp.type === 'star')) {
            powerUp.velocityY += 0.3 * dt;
            powerUp.y += powerUp.velocityY * dt;
            powerUp.x += powerUp.velocityX * dt;

            // Power-up platform collision
            allPlatforms.forEach(platform => {
              if (
                powerUp.x < platform.x + platform.width &&
                powerUp.x + 30 > platform.x &&
                powerUp.y < platform.y + platform.height &&
                powerUp.y + 30 > platform.y
              ) {
                if (powerUp.velocityY > 0) {
                  powerUp.y = platform.y - 30;
                  powerUp.velocityY = 0;
                }
                // Change direction at edges
                if (powerUp.velocityX !== 0) {
                  if (powerUp.x <= platform.x || powerUp.x + 30 >= platform.x + platform.width) {
                    powerUp.velocityX *= -1;
                  }
                }
              }
            });
          }

          // Check collision with player
          if (
            donut.x < powerUp.x + 30 &&
            donut.x + donut.width > powerUp.x &&
            donut.y < powerUp.y + 30 &&
            donut.y + donut.height > powerUp.y
          ) {
            powerUp.collected = true;
            createPowerUpSound();

            switch (powerUp.type) {
              case 'mushroom':
                if (!donut.isBig) {
                  donut.isBig = true;
                  donut.width = donut.baseWidth * 1.5;
                  donut.height = donut.baseHeight * 1.5;
                  donut.y -= 24;
                }
                game.score += 1000;
                setScore(game.score);
                createParticles(powerUp.x + 15, powerUp.y + 15, '#FF0000', 20);
                break;
              case 'star':
                donut.starPowerActive = true;
                donut.starPowerTimer = 600; // 10 seconds
                game.score += 1000;
                setScore(game.score);
                createParticles(powerUp.x + 15, powerUp.y + 15, '#FFD700', 25);
                break;
              case 'shield':
                donut.shieldActive = true;
                donut.shieldTimer = 300;
                createParticles(powerUp.x + 15, powerUp.y + 15, '#9b59b6', 20);
                break;
              case 'doublejump':
                donut.doubleJumpAvailable = true;
                createParticles(powerUp.x + 15, powerUp.y + 15, '#87CEEB', 15);
                break;
            }
          }

          return !powerUp.collected;
        });

        // Update collectibles (coins)
        game.collectibles = game.collectibles.filter(coin => {
          if (coin.collected) return false;
          if (coin.x < game.camera.x - 100) return false;

          // Apply physics only for coins that were thrown (have initial velocity)
          if (coin.velocityY !== undefined && coin.velocityY !== 0) {
            coin.velocityY += 0.5 * dt;
            coin.y += coin.velocityY * dt;

            // Bounce (with clamp to prevent tunneling)
            if (coin.y > coin.spawnY + 50) {
              coin.y = coin.spawnY + 50; // Clamp to prevent falling through
              if (Math.abs(coin.velocityY) > 0.5) { // Only bounce if moving fast enough
                coin.velocityY = -coin.velocityY * 0.5;
              } else {
                coin.velocityY = 0; // Stop bouncing if moving too slowly
              }
            }
          }

          // Check collision with player
          if (
            donut.x < coin.x + 20 &&
            donut.x + donut.width > coin.x &&
            donut.y < coin.y + 20 &&
            donut.y + donut.height > coin.y
          ) {
            coin.collected = true;
            game.coins++;
            game.score += 10;
            setCoins(game.coins);
            setScore(game.score);
            createCollectSound();
            createParticles(coin.x + 10, coin.y + 10, '#FFD700', 10);
          }

          return !coin.collected;
        });

        // Spawn floating coins randomly
        if (Math.random() < 0.01 * dt) {
          const lastPlatform = game.platforms.find(p => p.x > donut.x && p.x < donut.x + 600);
          if (lastPlatform) {
            const coinY = lastPlatform.y - 30 - Math.random() * 80;
            game.collectibles.push({
              x: lastPlatform.x + Math.random() * lastPlatform.width,
              y: coinY,
              collected: false,
              velocityY: 0,
              spawnY: coinY,
            });
          }
        }

        // Remove old objects
        game.platforms = game.platforms.filter(p => p.x > game.camera.x - 500);
        game.questionBlocks = game.questionBlocks.filter(b => b.x > game.camera.x - 500);
        game.pipes = game.pipes.filter(p => p.x > game.camera.x - 500);

      }

      // Keep the level visible behind the pause and game-over menus.
      if (gameState !== 'menu') {
        const donut = game.donut;
        game.pipes.forEach(pipe => {
          const screenX = pipe.x - game.camera.x;
          if (screenX > -100 && screenX < canvas.width + 100) {
            drawSurvivorPipe(ctx, screenX, pipe.y, pipe.width, pipe.height);
          }
        });
        game.platforms.forEach(platform => {
          const screenX = platform.x - game.camera.x;
          if (screenX + platform.width > 0 && screenX < canvas.width) {
            drawSurvivorPlatform(ctx, screenX, platform.y, platform.width, platform.height, platform.type);
          }
        });

        // Draw question blocks
        game.questionBlocks.forEach(block => {
          const screenX = block.x - game.camera.x;
          const drawY = block.y + block.bounceOffset;
          if (screenX > -100 && screenX < canvas.width + 100) {
            // Block background
            if (block.hit) {
              ctx.fillStyle = survivorPalette.ground; // Muted block after use
            } else {
              ctx.fillStyle = survivorPalette.gold;
            }
            ctx.fillRect(screenX, drawY, block.width, block.height);

            // Border
            ctx.strokeStyle = survivorPalette.ink;
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX, drawY, block.width, block.height);

            // Question mark
            if (!block.hit) {
              ctx.fillStyle = survivorPalette.brickShadow;
              ctx.font = `700 28px ${fontFamily}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('?', screenX + block.width / 2, drawY + block.height / 2);
            }
          }
        });

        game.collectibles.forEach(coin => {
          const screenX = coin.x - game.camera.x;
          if (!coin.collected && screenX > -50 && screenX < canvas.width + 50) {
            drawSurvivorCoin(ctx, screenX + 10, coin.y + 10);
          }
        });

        // Draw power-ups
        game.powerUps.forEach(powerUp => {
          if (!powerUp.collected) {
            const screenX = powerUp.x - game.camera.x;
            if (screenX > -50 && screenX < canvas.width + 50) {
              ctx.save();
              ctx.translate(screenX + 15, powerUp.y + 15);

              switch (powerUp.type) {
                case 'mushroom':
                  // Mushroom cap
                  ctx.fillStyle = survivorPalette.pink;
                  ctx.beginPath();
                  ctx.arc(0, -5, 15, Math.PI, 0);
                  ctx.fill();
                  // White spots
                  ctx.fillStyle = survivorPalette.paper;
                  ctx.beginPath();
                  ctx.arc(-5, -10, 4, 0, Math.PI * 2);
                  ctx.arc(5, -10, 4, 0, Math.PI * 2);
                  ctx.arc(0, -5, 4, 0, Math.PI * 2);
                  ctx.fill();
                  // Stem
                  ctx.fillStyle = survivorPalette.paper;
                  ctx.fillRect(-8, -5, 16, 15);
                  break;
                case 'star':
                  // Draw star shape
                  ctx.fillStyle = survivorPalette.gold;
                  ctx.beginPath();
                  for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const x = Math.cos(angle) * 15;
                    const y = Math.sin(angle) * 15;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.closePath();
                  ctx.fill();
                  // Eyes
                  ctx.fillStyle = survivorPalette.ink;
                  ctx.beginPath();
                  ctx.arc(-4, -2, 2, 0, Math.PI * 2);
                  ctx.arc(4, -2, 2, 0, Math.PI * 2);
                  ctx.fill();
                  break;
                case 'shield':
                  ctx.fillStyle = survivorPalette.lavender;
                  ctx.font = `24px ${fontFamily}`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.strokeStyle = survivorPalette.ink;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.moveTo(0, -12);
                  ctx.lineTo(12, -6);
                  ctx.lineTo(9, 6);
                  ctx.quadraticCurveTo(4, 12, 0, 15);
                  ctx.quadraticCurveTo(-4, 12, -9, 6);
                  ctx.lineTo(-12, -6);
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                  break;
                case 'doublejump':
                  ctx.fillStyle = '#37786b';
                  ctx.font = `24px ${fontFamily}`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.strokeStyle = '#37786b';
                  ctx.lineWidth = 3;
                  ctx.beginPath();
                  ctx.moveTo(-8, -3);
                  ctx.lineTo(0, -11);
                  ctx.lineTo(8, -3);
                  ctx.moveTo(0, -11);
                  ctx.lineTo(0, 12);
                  ctx.stroke();
                  break;
              }
              ctx.restore();
            }
          }
        });

        // Draw enemies
        game.enemies.forEach(enemy => {
          if (!enemy.alive) return;
          const screenX = enemy.x - game.camera.x;
          if (screenX > -50 && screenX < canvas.width + 50) {
            ctx.save();
            ctx.translate(screenX + enemy.width / 2, enemy.y + enemy.height / 2);

            if (enemy.type === 'goomba') {
              // Goomba body
              ctx.fillStyle = survivorPalette.brickShadow;
              ctx.beginPath();
              ctx.arc(0, 5, 18, 0, Math.PI * 2);
              ctx.fill();

              // Feet
              ctx.fillStyle = survivorPalette.ink;
              const footOffset = Math.sin(enemy.frame * Math.PI) * 3;
              ctx.fillRect(-15 + footOffset, 15, 12, 8);
              ctx.fillRect(3 - footOffset, 15, 12, 8);

              // Eyes
              ctx.fillStyle = survivorPalette.paper;
              ctx.beginPath();
              ctx.arc(-6, 0, 6, 0, Math.PI * 2);
              ctx.arc(6, 0, 6, 0, Math.PI * 2);
              ctx.fill();

              // Pupils
              ctx.fillStyle = survivorPalette.ink;
              ctx.beginPath();
              ctx.arc(-5, 0, 3, 0, Math.PI * 2);
              ctx.arc(7, 0, 3, 0, Math.PI * 2);
              ctx.fill();

              // Angry eyebrows
              ctx.strokeStyle = survivorPalette.ink;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(-12, -8);
              ctx.lineTo(-2, -5);
              ctx.moveTo(12, -8);
              ctx.lineTo(2, -5);
              ctx.stroke();
            } else if (enemy.type === 'koopa') {
              // Koopa shell
              ctx.fillStyle = survivorPalette.sage;
              ctx.beginPath();
              ctx.ellipse(0, 5, 18, 20, 0, 0, Math.PI * 2);
              ctx.fill();

              // Shell pattern
              ctx.strokeStyle = survivorPalette.ink;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.ellipse(0, 5, 12, 14, 0, 0, Math.PI * 2);
              ctx.stroke();

              // Head
              ctx.fillStyle = survivorPalette.gold;
              ctx.beginPath();
              ctx.arc(0, -20, 10, 0, Math.PI * 2);
              ctx.fill();

              // Eyes
              ctx.fillStyle = survivorPalette.paper;
              ctx.beginPath();
              ctx.arc(-4, -22, 4, 0, Math.PI * 2);
              ctx.arc(4, -22, 4, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = survivorPalette.ink;
              ctx.beginPath();
              ctx.arc(-4, -22, 2, 0, Math.PI * 2);
              ctx.arc(4, -22, 2, 0, Math.PI * 2);
              ctx.fill();

              // Feet
              ctx.fillStyle = survivorPalette.gold;
              const footOffset = Math.sin(enemy.frame * Math.PI) * 4;
              ctx.fillRect(-12 + footOffset, 20, 10, 6);
              ctx.fillRect(2 - footOffset, 20, 10, 6);
            }

            ctx.restore();
          }
        });

        // Update and draw particles
        const particleDt = gameState === 'playing' ? dt : 0;
        game.particles = game.particles.filter(particle => {
          particle.x += particle.vx * particleDt;
          particle.y += particle.vy * particleDt;
          particle.vy += 0.2 * particleDt;
          particle.life -= 0.02 * particleDt;

          if (particle.life > 0) {
            const screenX = particle.x - game.camera.x;
            if (screenX > -50 && screenX < canvas.width + 50) {
              ctx.save();
              ctx.globalAlpha = particle.life;
              ctx.fillStyle = particle.color;
              ctx.fillRect(screenX - 3, particle.y - 3, 6, 6);
              ctx.restore();
            }
            return true;
          }
          return false;
        });

        // Draw donut
        const donutScreenX = donut.x - game.camera.x;
        ctx.save();
        ctx.translate(donutScreenX + donut.width / 2, donut.y + donut.height / 2);
        ctx.rotate(donut.rotation);

        // Star power effect
        if (donut.starPowerActive) {
          const starColor = Math.sin(Date.now() * 0.01) > 0 ? '#FFD700' : '#FFA500';
          ctx.strokeStyle = starColor;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 35, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Invincibility flash
        if (donut.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }

        // Draw shield if active
        if (donut.shieldActive && !donut.starPowerActive) {
          ctx.strokeStyle = survivorPalette.lavender;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, donut.width / 2 + 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw donut sprite or fallback
        if (donutSpriteRef.current?.complete && donutSpriteRef.current.naturalWidth > 0) {
          ctx.drawImage(
            donutSpriteRef.current,
            -donut.width / 2, -donut.height / 2, donut.width, donut.height
          );
        } else {
          // Fallback donut
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(0, 0, donut.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.arc(0, 0, donut.width / 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        ctx.save();
        ctx.fillStyle = survivorPalette.paper;
        ctx.strokeStyle = survivorPalette.ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(14, 14, 440, 42, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = survivorPalette.ink;
        ctx.font = `700 18px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(`Score: ${game.score}`, 28, 41);
        ctx.fillText(`Coins: ${game.coins}`, 164, 41);
        ctx.fillText(`Distance: ${Math.floor(game.distance / 10)}m`, 280, 41);

        const abilities = [];
        if (donut.isBig) abilities.push('Big donut');
        if (donut.starPowerTimer > 0) abilities.push(`Star: ${Math.ceil(donut.starPowerTimer / 60)}s`);
        if (donut.shieldTimer > 0) abilities.push(`Shield: ${Math.ceil(donut.shieldTimer / 60)}s`);
        if (donut.invincibleTimer > 0) abilities.push(`Invincible: ${Math.ceil(donut.invincibleTimer / 60)}s`);
        if (abilities.length > 0) {
          ctx.font = `700 14px ${fontFamily}`;
          const text = abilities.join(' / ');
          ctx.fillStyle = survivorPalette.paper;
          ctx.beginPath();
          ctx.roundRect(14, 66, ctx.measureText(text).width + 28, 32, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = survivorPalette.ink;
          ctx.fillText(text, 28, 87);
        }
        ctx.restore();
      }

      keysPressedLastFrame.current = new Set(keysPressed.current);
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, highScore, score, distance, coins, startGame, togglePause, gameOver, hurtPlayer]);

  return (
    <div className={styles.game}>
      <div ref={donutArtRef} className={styles.sprite} aria-hidden="true">
        <DonutArt />
      </div>
      <div className={styles.toolbar}>
        <p className={styles.best}>Personal best <strong>{highScore}</strong></p>
        {(gameState === 'playing' || gameState === 'paused') && (
          <button className={styles.pauseButton} onClick={togglePause} aria-label={gameState === 'paused' ? 'Resume game' : 'Pause game'}>
            {gameState === 'paused' ? 'Resume' : 'Pause'} <span aria-hidden="true"> / Esc</span>
          </button>
        )}
      </div>
      <div className={styles.stage}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className={styles.canvas}
          aria-label="Donut Survivor play area. Arrow keys or WASD to move. Space to jump. Escape to pause."
        >
          Donut Survivor requires a browser that supports canvas.
        </canvas>
        {gameState !== 'playing' && (
          <div className={styles.overlay}>
            <div className={styles.panel} data-state={gameState} aria-live="polite">
              <DonutArt className={styles.mascot} />
              <p className={styles.eyebrow}>Sunday Night Games / Platformer</p>
              <h2>{gameState === 'gameover' ? 'One more run?' : gameState === 'paused' ? 'Taking a breather.' : 'Run. Jump. Sprinkle.'}</h2>
              {gameState === 'gameover' ? (
                <>
                  <p className={styles.score} aria-label={`Final score: ${score}`}>{score}</p>
                  {score === highScore && score > 0 && <p className={styles.record}>New personal best!</p>}
                  <p className={styles.copy}>{coins} coins collected / {distance}m travelled</p>
                </>
              ) : (
                <p className={styles.copy}>
                  {gameState === 'paused' ? 'Your donut will be right here.' : 'Dodge trouble, jump on enemies, and hit ? blocks for a little help.'}
                </p>
              )}
              <button className={styles.playButton} onClick={gameState === 'paused' ? togglePause : startGame}>
                {gameState === 'paused' ? 'Keep going' : gameState === 'gameover' ? 'Play again' : "Let's play"}
              </button>
              <p className={styles.hint}>{gameState === 'paused' ? 'or press Esc to resume' : 'or press Space'}</p>
            </div>
          </div>
        )}
      </div>
      <div className={styles.controls}>
        <p><kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> move / <kbd>↑</kbd> <kbd>W</kbd> or <kbd>Space</kbd> jump / <kbd>Esc</kbd> pause</p>
        <p>Jump on enemies. Hit ? blocks for coins and power-ups.</p>
      </div>
    </div>
  );
}
