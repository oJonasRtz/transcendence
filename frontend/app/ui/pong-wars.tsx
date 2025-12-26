'use client';

import { useEffect, useRef } from 'react';

type Trail = { x: number; y: number; life: number };

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  reverseColor: string;
  ballColor: string;
  trail: Trail[];
};

export default function PongWars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const COLORS = {
      SPACE: '#050B1E',
      SECTOR_A: '#0D1B2A',
      SECTOR_B: '#1B263B',
      SHIP_A: '#4CC9F0',
      SHIP_B: '#F72585',
      STAR: '#FFFFFF',
    };

    const SQUARE_SIZE = 25;
    const MIN_SPEED = 5;
    const MAX_SPEED = 10;
    const FRAME_RATE = 60;

    const numSquaresX = canvas.width / SQUARE_SIZE;
    const numSquaresY = canvas.height / SQUARE_SIZE;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      s: Math.random() * 0.4 + 0.1,
    }));

    const squares: string[][] = [];
    for (let i = 0; i < numSquaresX; i++) {
      squares[i] = [];
      for (let j = 0; j < numSquaresY; j++) {
        squares[i][j] =
          i < numSquaresX / 2 ? COLORS.SECTOR_A : COLORS.SECTOR_B;
      }
    }

    const balls: Ball[] = [
      {
        x: canvas.width / 4,
        y: canvas.height / 2,
        dx: 8,
        dy: -8,
        reverseColor: COLORS.SECTOR_A,
        ballColor: COLORS.SHIP_A,
        trail: [],
      },
      {
        x: (canvas.width / 4) * 3,
        y: canvas.height / 2,
        dx: -8,
        dy: 8,
        reverseColor: COLORS.SECTOR_B,
        ballColor: COLORS.SHIP_B,
        trail: [],
      },
    ];

    function drawSpace() {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, '#020617');
      g.addColorStop(1, COLORS.SPACE);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        s.y += s.s;
        if (s.y > canvas.height) s.y = 0;
        ctx.fillStyle = COLORS.STAR;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawSquares() {
      for (let i = 0; i < numSquaresX; i++) {
        for (let j = 0; j < numSquaresY; j++) {
          ctx.fillStyle = squares[i][j];
          ctx.fillRect(
            i * SQUARE_SIZE,
            j * SQUARE_SIZE,
            SQUARE_SIZE,
            SQUARE_SIZE
          );
        }
      }
    }

    function drawShip(ball: Ball) {
      const angle = Math.atan2(ball.dy, ball.dx);

      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(angle);

      ctx.shadowColor = ball.ballColor;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-10, 8);
      ctx.closePath();

      ctx.fillStyle = ball.ballColor;
      ctx.fill();
      ctx.restore();
    }

    function drawTrail(ball: Ball) {
      ball.trail.push({ x: ball.x, y: ball.y, life: 1 });

      ball.trail.forEach((t) => (t.life -= 0.06));
      ball.trail = ball.trail.filter((t) => t.life > 0);

      ball.trail.forEach((t) => {
        ctx.fillStyle = `rgba(255,255,255,${t.life * 0.3})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function checkSquareCollision(ball: Ball) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const checkX = ball.x + Math.cos(angle) * 12;
        const checkY = ball.y + Math.sin(angle) * 12;

        const i = Math.floor(checkX / SQUARE_SIZE);
        const j = Math.floor(checkY / SQUARE_SIZE);

        if (i >= 0 && i < numSquaresX && j >= 0 && j < numSquaresY) {
          if (squares[i][j] !== ball.reverseColor) {
            squares[i][j] = ball.reverseColor;

            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
              ball.dx = -ball.dx;
              ball.dy += (Math.random() - 0.5) * 2;
            } else {
              ball.dy = -ball.dy;
              ball.dx += (Math.random() - 0.5) * 2;
            }
          }
        }
      }
    }

    function checkBoundaryCollision(ball: Ball) {
      if (ball.x < 12 || ball.x > canvas.width - 12) {
        ball.dx = -ball.dx;
        ball.dy += (Math.random() - 0.5) * 1.5;
      }
      if (ball.y < 12 || ball.y > canvas.height - 12) {
        ball.dy = -ball.dy;
        ball.dx += (Math.random() - 0.5) * 1.5;
      }
    }

    function addRandomness(ball: Ball) {
      ball.dx += Math.random() * 0.2 - 0.1;
      ball.dy += Math.random() * 0.2 - 0.1;

      ball.dx = Math.min(Math.max(ball.dx, -MAX_SPEED), MAX_SPEED);
      ball.dy = Math.min(Math.max(ball.dy, -MAX_SPEED), MAX_SPEED);

      if (Math.abs(ball.dx) < MIN_SPEED)
        ball.dx = ball.dx > 0 ? MIN_SPEED : -MIN_SPEED;
      if (Math.abs(ball.dy) < MIN_SPEED)
        ball.dy = ball.dy > 0 ? MIN_SPEED : -MIN_SPEED;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSpace();
      drawSquares();

      balls.forEach((ball) => {
        drawTrail(ball);
        drawShip(ball);
        checkSquareCollision(ball);
        checkBoundaryCollision(ball);
        ball.x += ball.dx;
        ball.y += ball.dy;
        addRandomness(ball);
      });
    }

    const interval = setInterval(draw, 1000 / FRAME_RATE);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="rounded-lg shadow-2xl w-full max-w-[600px]"
    />
  );
}
