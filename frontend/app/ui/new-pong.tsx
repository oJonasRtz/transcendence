'use client';

import { useEffect, useRef } from 'react';

export default function NewPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const ball = { x: 250, y: 250, dx: 4, dy: 4, size: 8 };
    const paddleHeight = 60;
    const paddleWidth = 10;
    const leftPaddle = { y: 220, score: 0 };
    const rightPaddle = { y: 220, score: 0 };
    const speed = 4; 

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = canvas.parentElement?.clientHeight || 500;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.fillStyle = '#0f172a'; // Match Slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#334155';
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; 

      ctx.fillStyle = '#3b82f6'; // Blue-500
      ctx.fillRect(10, leftPaddle.y, paddleWidth, paddleHeight);
      
      ctx.fillStyle = '#ec4899'; // Pink-500
      ctx.fillRect(canvas.width - 20, rightPaddle.y, paddleWidth, paddleHeight);

      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy *= -1;
      }

      if (leftPaddle.y + paddleHeight / 2 < ball.y) leftPaddle.y += speed;
      else leftPaddle.y -= speed;

      if (rightPaddle.y + paddleHeight / 2 < ball.y) rightPaddle.y += speed;
      else rightPaddle.y -= speed;

      leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
      rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));

      if (
        ball.x - ball.size < 10 + paddleWidth &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + paddleHeight
      ) {
        ball.dx *= -1;
      }
      if (
        ball.x + ball.size > canvas.width - 20 &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + paddleHeight
      ) {
        ball.dx *= -1;
      }

      if (ball.x < 0 || ball.x > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1; 
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}