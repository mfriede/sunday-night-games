// Match the Flappy Donut illustration on the arcade homepage.
export const flappyPalette = {
  ink: "#252623",
  paper: "#fffdf8",
  mint: "#b8decf",
  pink: "#f466a3",
  yellow: "#f9dd93",
  lavender: "#7d57c3",
  teal: "#37786b",
};

export function drawFlappyBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
) {
  ctx.fillStyle = flappyPalette.mint;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = flappyPalette.yellow;
  ctx.strokeStyle = flappyPalette.ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(width - 65, 90, 31, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  for (const [startX, y, scale] of [[80, 100, 1], [320, 270, 0.8], [170, 405, 0.65]]) {
    const x = ((startX - frame * 0.25 + 120) % (width + 240) + width + 240) % (width + 240) - 120;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = flappyPalette.paper;
    ctx.beginPath();
    ctx.moveTo(-36, 12);
    ctx.bezierCurveTo(-48, 12, -48, -8, -30, -10);
    ctx.bezierCurveTo(-30, -36, 7, -36, 10, -15);
    ctx.bezierCurveTo(33, -26, 47, -7, 35, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "#8bbb9c";
  ctx.strokeStyle = "#6c9879";
  ctx.beginPath();
  ctx.ellipse(70, height + 35, 230, 90, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#9bc7aa";
  ctx.beginPath();
  ctx.ellipse(width, height + 40, 220, 115, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

export function drawFlappyPipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  topHeight: number,
  gap: number,
  width: number,
  height: number,
) {
  const drawSection = (y: number, sectionHeight: number, capY: number) => {
    ctx.fillStyle = "#769b67";
    ctx.fillRect(x, y, width, sectionHeight);
    ctx.fillStyle = "#9fc08c";
    ctx.fillRect(x + 10, y, 8, sectionHeight);
    ctx.fillStyle = "#58834c";
    ctx.fillRect(x + width - 8, y, 8, sectionHeight);
    ctx.strokeStyle = flappyPalette.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, sectionHeight);
    // Keep the cap inside the pipe's collision bounds.
    ctx.fillStyle = "#9fc08c";
    ctx.fillRect(x, capY, width, 24);
    ctx.fillStyle = "#769b67";
    ctx.fillRect(x, capY + 18, width, 6);
    ctx.strokeRect(x, capY, width, 24);
  };
  drawSection(0, topHeight, topHeight - 24);
  drawSection(topHeight + gap, height - topHeight - gap, topHeight + gap);
}

export function drawFlappyPowerUp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: "slowmo" | "shield",
) {
  ctx.save();
  ctx.translate(x + 15, y + 15);
  ctx.fillStyle = type === "slowmo" ? flappyPalette.yellow : "#d9cfed";
  ctx.strokeStyle = flappyPalette.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  if (type === "slowmo") {
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 0);
    ctx.lineTo(4, 2);
  } else {
    ctx.moveTo(0, -9);
    ctx.lineTo(8, -5);
    ctx.lineTo(6, 4);
    ctx.quadraticCurveTo(3, 8, 0, 10);
    ctx.quadraticCurveTo(-3, 8, -6, 4);
    ctx.lineTo(-8, -5);
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}
