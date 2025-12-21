'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './DonutGame.module.css';

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
  type: 'spike' | 'moving';
  direction?: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'doublejump' | 'shield' | 'magnet';
  collected: boolean;
}

interface Collectible {
  x: number;
  y: number;
  collected: boolean;
}

export default function DonutSurvivor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [distance, setDistance] = useState(0);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('donut-survivor-high-score');
    if (saved) setHighScore(parseInt(saved));
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
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      doubleJumpAvailable: false,
      shieldActive: false,
      shieldTimer: 0,
      rotation: 0,
      frame: 0,
    },
    camera: {
      x: 0,
      y: 0,
    },
    platforms: [] as Array<{x: number, y: number, width: number, height: number}>,
    enemies: [] as Enemy[],
    powerUps: [] as PowerUp[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    gameSpeed: 3,
    distance: 0,
    score: 0,
    magnetActive: false,
    magnetTimer: 0,
  });

  const animationFrameRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const donutSpriteRef = useRef<HTMLImageElement | null>(null);
  const collectibleSpriteRef = useRef<HTMLImageElement | null>(null);

  // Load sprites
  useEffect(() => {
    console.log('Loading donut sprite...');
    const donutSprite = new Image();
    donutSprite.src = '/donut.png';

    donutSprite.onload = () => {
      console.log('Donut sprite loaded successfully!', {
        width: donutSprite.width,
        height: donutSprite.height,
        complete: donutSprite.complete
      });
      donutSpriteRef.current = donutSprite;
    };

    donutSprite.onerror = (e) => {
      console.error('Failed to load donut sprite:', e);
    };

    const collectibleSprite = new Image();
    collectibleSprite.src = '/images/coin_sprite.png';
    collectibleSprite.onload = () => {
      collectibleSpriteRef.current = collectibleSprite;
    };
    collectibleSprite.onerror = () => {
      console.error('Failed to load coin sprite');
    };
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number = 10) => {
    const particles = gameStateRef.current.particles;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        color,
      });
    }
  };

  const createJumpSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      doubleJumpAvailable: false,
      shieldActive: false,
      shieldTimer: 0,
      rotation: 0,
      frame: 0,
    };

    // Reset camera
    game.camera.x = 0;
    game.camera.y = 0;

    // Generate initial platforms
    game.platforms = [];
    const platformWidth = 120;

    // Starting platform
    game.platforms.push({
      x: 0,
      y: 350,
      width: 300,
      height: 20,
    });

    // Generate ahead
    let lastX = 300;
    for (let i = 0; i < 50; i++) {
      const gap = 100 + Math.random() * 150;
      const y = 250 + Math.random() * 200;
      game.platforms.push({
        x: lastX + gap,
        y,
        width: platformWidth + Math.random() * 80,
        height: 20,
      });
      lastX += gap;
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
    game.magnetActive = false;
    game.magnetTimer = 0;

    setScore(0);
    setDistance(0);
  }, []);

  const startGame = useCallback(() => {
    initializeGame();
    setGameState('playing');
  }, [initializeGame]);

  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const gameOver = useCallback(() => {
    setGameState('gameover');
    createParticles(gameStateRef.current.donut.x, gameStateRef.current.donut.y, '#ff0000', 30);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Load donut image directly
    const donutImg = new Image();
    donutImg.src = '/donut.png';
    donutImg.onload = () => {
      console.log('Donut image loaded for canvas rendering');
      donutSpriteRef.current = donutImg;
    };
    donutImg.onerror = () => {
      console.error('Failed to load donut image');
    };

    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());

      if (e.key === 'Escape' && (gameState === 'playing' || gameState === 'paused')) {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      const game = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'menu') {
        // Draw menu
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Donut Survivor', canvas.width / 2, 150);

        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, 250);

        ctx.font = '18px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 300);

        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Controls: Arrow Keys/WASD to Move', canvas.width / 2, 350);
        ctx.fillText('Collect coins and power-ups!', canvas.width / 2, 380);

        if (keysPressed.current.has(' ')) {
          startGame();
        }
      } else if (gameState === 'paused') {
        // Draw game state paused
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);

        ctx.font = '24px Arial';
        ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 50);
      } else if (gameState === 'gameover') {
        // Draw game over
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, 150);

        ctx.font = '32px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, 220);

        if (score === highScore && score > 0) {
          ctx.fillStyle = '#FFD700';
          ctx.font = '24px Arial';
          ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, 270);
        }

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, 320);
        ctx.fillText('Distance: ${Math.floor(distance)}m', canvas.width / 2, 360);

        ctx.font = '18px Arial';
        ctx.fillText('Press SPACE to Play Again', canvas.width / 2, 390);

        if (keysPressed.current.has(' ')) {
          startGame();
        }
      } else if (gameState === 'playing') {
        // Update game logic
        const donut = game.donut;
        const speed = 5;

        // Handle input
        donut.velocityX = 0;

        if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) {
          donut.velocityX = -speed;
        }
        if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) {
          donut.velocityX = speed;
        }
        if ((keysPressed.current.has('arrowup') || keysPressed.current.has(' ') || keysPressed.current.has('w')) && !donut.isJumping) {
          donut.velocityY = -12;
          donut.isJumping = true;
          createJumpSound();
        } else if ((keysPressed.current.has('arrowup') || keysPressed.current.has(' ') || keysPressed.current.has('w')) && donut.doubleJumpAvailable) {
          donut.velocityY = -10;
          donut.doubleJumpAvailable = false;
          createJumpSound();
          createParticles(donut.x + donut.width / 2, donut.y + donut.height, '#87CEEB', 10);
        }

        // Apply physics
        donut.velocityY += 0.6; // Gravity
        donut.x += donut.velocityX;
        donut.y += donut.velocityY;

        // Update rotation based on velocity
        if (!donut.isJumping) {
          donut.rotation += donut.velocityX * 0.05;
        }

        // Update animation frame
        donut.frame = (donut.frame + 0.2) % 4;

        // Update camera to follow donut
        game.camera.x = donut.x - canvas.width / 2;

        // Update distance and score
        if (donut.x > game.distance) {
          game.distance = donut.x;
          setDistance(Math.floor(donut.x / 10));
          if (Math.floor(donut.x / 100) > game.score) {
            game.score = Math.floor(donut.x / 100);
            setScore(game.score);
          }
        }

        // Update power-up timers
        if (donut.shieldTimer > 0) {
          donut.shieldTimer--;
          if (donut.shieldTimer === 0) {
            donut.shieldActive = false;
          }
        }
        if (game.magnetTimer > 0) {
          game.magnetTimer--;
          if (game.magnetTimer === 0) {
            game.magnetActive = false;
          }
        }

        // Platform collision
        donut.isJumping = true;
        game.platforms.forEach((platform) => {
          if (
            donut.x < platform.x + platform.width &&
            donut.x + donut.width > platform.x &&
            donut.y < platform.y + platform.height &&
            donut.y + donut.height > platform.y
          ) {
            donut.y = platform.y - donut.height;
            donut.velocityY = 0;
            donut.isJumping = false;
            donut.doubleJumpAvailable = true;
          }
        });

        // Check if fallen
        if (donut.y > canvas.height) {
          gameOver();
        }

        // Generate new platforms
        const rightmostPlatform = game.platforms[game.platforms.length - 1];
        if (rightmostPlatform.x < game.camera.x + canvas.width * 2) {
          const lastPlatform = game.platforms[game.platforms.length - 2];
          const gap = 100 + Math.random() * 150;
          const y = 250 + Math.random() * 200;
          game.platforms.push({
            x: lastPlatform.x + gap,
            y,
            width: 120 + Math.random() * 80,
            height: 20,
          });
        }

        // Remove old platforms
        game.platforms = game.platforms.filter(p => p.x > game.camera.x - 500);

        // Spawn coins
        if (Math.random() < 0.02) {
          const lastPlatform = game.platforms.find(p => p.x > donut.x && p.x < donut.x + 500);
          if (lastPlatform) {
            game.collectibles.push({
              x: lastPlatform.x + Math.random() * lastPlatform.width,
              y: lastPlatform.y - 30 - Math.random() * 50,
              collected: false,
            });
          }
        }

        // Spawn power-ups
        if (Math.random() < 0.005) {
          const lastPlatform = game.platforms.find(p => p.x > donut.x && p.x < donut.x + 500);
          if (lastPlatform) {
            game.powerUps.push({
              x: lastPlatform.x + Math.random() * lastPlatform.width,
              y: lastPlatform.y - 60 - Math.random() * 30,
              type: Math.random() < 0.5 ? 'shield' : 'magnet',
              collected: false,
            });
          }
        }

        // Collect coins
        game.collectibles = game.collectibles.filter(coin => !coin.collected && coin.x > game.camera.x - 100);
        game.collectibles.forEach((coin, index) => {
          // Apply magnet effect
          if (game.magnetActive) {
            const dx = donut.x - coin.x;
            const dy = donut.y - coin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              coin.x += dx * 0.1;
              coin.y += dy * 0.1;
            }
          }

          if (
            donut.x < coin.x + 20 &&
            donut.x + donut.width > coin.x &&
            donut.y < coin.y + 20 &&
            donut.y + donut.height > coin.y
          ) {
            coin.collected = true;
            game.score += 10;
            setScore(game.score);
            createCollectSound();
            createParticles(coin.x + 10, coin.y + 10, '#FFD700', 15);
          }
        });

        // Collect power-ups
        game.powerUps = game.powerUps.filter(powerUp => !powerUp.collected && powerUp.x > game.camera.x - 100);
        game.powerUps.forEach((powerUp, index) => {
          if (
            donut.x < powerUp.x + 30 &&
            donut.x + donut.width > powerUp.x &&
            donut.y < powerUp.y + 30 &&
            donut.y + donut.height > powerUp.y
          ) {
            powerUp.collected = true;

            switch(powerUp.type) {
              case 'shield':
                donut.shieldActive = true;
                donut.shieldTimer = 300;
                createParticles(powerUp.x + 15, powerUp.y + 15, '#9b59b6', 20);
                break;
              case 'magnet':
                game.magnetActive = true;
                game.magnetTimer = 300;
                createParticles(powerUp.x + 15, powerUp.y + 15, '#3498db', 20);
                break;
            }
          }
        });

        // Draw platforms
        ctx.fillStyle = '#8B4513';
        game.platforms.forEach(platform => {
          const screenX = platform.x - game.camera.x;
          if (screenX > -100 && screenX < canvas.width + 100) {
            // Platform gradient
            const gradient = ctx.createLinearGradient(screenX, platform.y, screenX, platform.y + platform.height);
            gradient.addColorStop(0, '#A0522D');
            gradient.addColorStop(1, '#8B4513');
            ctx.fillStyle = gradient;
            ctx.fillRect(screenX, platform.y, platform.width, platform.height);

            // Grass on top
            ctx.fillStyle = '#228B22';
            ctx.fillRect(screenX, platform.y, platform.width, 5);
          }
        });

        // Draw coins
        game.collectibles.forEach(coin => {
          if (!coin.collected) {
            const screenX = coin.x - game.camera.x;
            if (screenX > -50 && screenX < canvas.width + 50) {
              ctx.save();
              ctx.translate(screenX + 10, coin.y + 10);
              ctx.rotate(Date.now() * 0.002);
              ctx.fillStyle = '#FFD700';
              ctx.beginPath();
              ctx.arc(0, 0, 10, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#FFA500';
              ctx.beginPath();
              ctx.arc(0, 0, 6, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        });

        // Draw power-ups
        game.powerUps.forEach(powerUp => {
          if (!powerUp.collected) {
            const screenX = powerUp.x - game.camera.x;
            if (screenX > -50 && screenX < canvas.width + 50) {
              ctx.save();
              ctx.translate(screenX + 15, powerUp.y + 15);
              ctx.rotate(Date.now() * 0.003);

              switch(powerUp.type) {
                case 'shield':
                  ctx.fillStyle = '#9b59b6';
                  ctx.font = '24px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText('🛡', 0, 0);
                  break;
                case 'magnet':
                  ctx.fillStyle = '#3498db';
                  ctx.font = '24px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText('🧲', 0, 0);
                  break;
              }
              ctx.restore();
            }
          }
        });

        // Update and draw particles
        game.particles = game.particles.filter(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.2;
          particle.life -= 0.02;

          if (particle.life > 0) {
            const screenX = particle.x - game.camera.x;
            if (screenX > -50 && screenX < canvas.width + 50) {
              ctx.save();
              ctx.globalAlpha = particle.life;
              ctx.fillStyle = particle.color;
              ctx.fillRect(screenX - 2, particle.y - 2, 4, 4);
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

        // Draw shield if active
        if (donut.shieldActive) {
          ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 35, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw donut sprite or fallback
        if (donutSpriteRef.current && donutSpriteRef.current.complete) {
          // Draw the donut image
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

        // Draw UI
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.strokeText(`Score: ${game.score}`, 10, 40);
        ctx.fillText(`Score: ${game.score}`, 10, 40);

        ctx.strokeText(`Distance: ${Math.floor(game.distance / 10)}m`, 10, 70);
        ctx.fillText(`Distance: ${Math.floor(game.distance / 10)}m`, 10, 70);

        // Draw power-up status
        if (donut.shieldTimer > 0) {
          ctx.fillStyle = '#9b59b6';
          ctx.font = '16px Arial';
          ctx.fillText(`Shield: ${Math.ceil(donut.shieldTimer / 60)}s`, 10, 100);
        }
        if (game.magnetTimer > 0) {
          ctx.fillStyle = '#3498db';
          ctx.font = '16px Arial';
          ctx.fillText(`Magnet: ${Math.ceil(game.magnetTimer / 60)}s`, 10, 130);
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, highScore, score, distance, startGame, togglePause, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4">
      <canvas
        ref={canvasRef}
        className="border-4 border-gray-700 rounded-lg shadow-2xl"
      />

      <div className="mt-4 text-white text-center">
        <p className="text-lg font-semibold">High Score: {highScore}m</p>
        <p className="text-sm text-gray-200 mt-2">
          Use Arrow Keys or WASD to move • ESC to pause
        </p>
      </div>
    </div>
  );
}