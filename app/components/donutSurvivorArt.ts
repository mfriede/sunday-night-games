// Colors and scenery from the Donut Survivor card on the homepage.
export const survivorPalette = {
  ink: '#252623',
  paper: '#fffdf8',
  sky: '#c8c4e7',
  pink: '#f466a3',
  gold: '#f6d970',
  goldShadow: '#9b6c1e',
  brick: '#bd8971',
  brickShadow: '#775a4f',
  ground: '#a58e6d',
  sage: '#769b67',
  lavender: '#7d57c3',
};

export function drawSurvivorBackground(ctx: CanvasRenderingContext2D, cameraX: number) {
  ctx.fillStyle = survivorPalette.sky;
  ctx.fillRect(0, 0, 800, 400);
  ctx.strokeStyle = survivorPalette.ink;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = '#ffe7a0';
  ctx.beginPath();
  ctx.arc(710, 83, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#b0add4';
  ctx.strokeStyle = '#9290b9';
  for (let i = 0; i < 5; i++) {
    const x = ((i * 300 - cameraX * 0.3) % 1500 + 1500) % 1500 - 300;
    ctx.beginPath();
    ctx.ellipse(x, 440, 230, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = survivorPalette.paper;
  ctx.strokeStyle = survivorPalette.ink;
  for (let i = 0; i < 6; i++) {
    const x = ((i * 210 - cameraX * 0.2) % 1260 + 1260) % 1260 - 100;
    const y = 90 + (i % 3) * 35;
    ctx.beginPath();
    ctx.moveTo(x - 35, y + 12);
    ctx.bezierCurveTo(x - 48, y + 12, x - 48, y - 8, x - 30, y - 10);
    ctx.bezierCurveTo(x - 30, y - 36, x + 7, y - 36, x + 10, y - 15);
    ctx.bezierCurveTo(x + 33, y - 26, x + 47, y - 7, x + 35, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export function drawSurvivorPlatform(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  type: 'ground' | 'brick' | 'block',
) {
  ctx.fillStyle = type === 'ground' ? survivorPalette.ground : survivorPalette.brick;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = survivorPalette.gold;
  ctx.fillRect(x, y, width, 6);
  ctx.strokeStyle = survivorPalette.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, width, height);
  if (type !== 'ground') {
    ctx.strokeStyle = survivorPalette.brickShadow;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    for (let offset = 20; offset < width; offset += 40) {
      ctx.moveTo(x + offset, y + 6);
      ctx.lineTo(x + offset, y + height / 2);
      ctx.moveTo(x + offset + 20, y + height / 2);
      ctx.lineTo(Math.min(x + offset + 20, x + width), y + height);
    }
    ctx.stroke();
  }
}

export function drawSurvivorPipe(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.fillStyle = survivorPalette.sage;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#9fc08c';
  ctx.fillRect(x + 10, y, 8, height);
  ctx.fillStyle = '#58834c';
  ctx.fillRect(x + width - 8, y, 8, height);
  ctx.strokeStyle = survivorPalette.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = '#9fc08c';
  ctx.fillRect(x, y, width, 20);
  ctx.fillStyle = survivorPalette.sage;
  ctx.fillRect(x, y + 15, width, 5);
  ctx.strokeRect(x, y, width, 20);
}

export function drawSurvivorCoin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = survivorPalette.gold;
  ctx.strokeStyle = survivorPalette.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = survivorPalette.goldShadow;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(2, -2);
  ctx.lineTo(6, 0);
  ctx.lineTo(2, 2);
  ctx.lineTo(0, 6);
  ctx.lineTo(-2, 2);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-2, -2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
