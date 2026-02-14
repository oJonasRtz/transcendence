"use client";

import { useEffect, useRef } from "react";

const WIDTH = 960;
const HEIGHT = 540;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 94;
const PADDLE_MARGIN = 36;
const BALL_RADIUS = 9;
const PLAYER_SPEED = 520;
const AI_SPEED = 440;
const BASE_BALL_SPEED = 360;
const BALL_ACCELERATION = 30;
const MAX_BALL_SPEED = 760;
const MAX_BOUNCE_ANGLE = Math.PI / 3;
const SERVE_DELAY_MS = 700;

type Side = "player" | "ai";

export type PongAIScore = {
  player: number;
  ai: number;
};

export type PongAIWinner = Side;

interface PongAIProps {
  restartSignal: number;
  maxScore?: number;
  onScoreChange: (score: PongAIScore) => void;
  onGameEnd: (winner: PongAIWinner) => void;
}

type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  active: boolean;
  serveAt: number;
};

type GameState = {
  playerY: number;
  aiY: number;
  ball: BallState;
  score: PongAIScore;
  winner: PongAIWinner | null;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const createInitialState = (): GameState => ({
  playerY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  aiY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
  ball: {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    vx: 1,
    vy: 0,
    speed: BASE_BALL_SPEED,
    active: false,
    serveAt: 0,
  },
  score: {
    player: 0,
    ai: 0,
  },
  winner: null,
});

export default function PongAI({
  restartSignal,
  maxScore = 7,
  onScoreChange,
  onGameEnd,
}: PongAIProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const keys = { up: false, down: false };
    const state = createInitialState();
    let lastTime = performance.now();

    const resetBall = (direction: -1 | 1, now: number) => {
      const angle = (Math.random() * 2 - 1) * (Math.PI / 8);
      state.ball = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        vx: Math.cos(angle) * direction,
        vy: Math.sin(angle),
        speed: BASE_BALL_SPEED,
        active: false,
        serveAt: now + SERVE_DELAY_MS,
      };
    };

    const handleScore = (side: Side, now: number) => {
      state.score[side] += 1;
      onScoreChange({ ...state.score });

      if (state.score[side] >= maxScore) {
        state.winner = side;
        onGameEnd(side);
        state.ball.active = false;
        return;
      }

      const nextDirection: -1 | 1 = side === "player" ? -1 : 1;
      resetBall(nextDirection, now);
    };

    const predictBallY = (): number => {
      if (state.ball.vx <= 0) return HEIGHT / 2;

      const targetX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_RADIUS;
      const deltaX = targetX - state.ball.x;
      if (deltaX <= 0 || state.ball.speed <= 0) return state.ball.y;

      const time = deltaX / (state.ball.vx * state.ball.speed);
      let projectedY = state.ball.y + state.ball.vy * state.ball.speed * time;
      const minY = BALL_RADIUS;
      const maxY = HEIGHT - BALL_RADIUS;

      while (projectedY < minY || projectedY > maxY) {
        if (projectedY < minY) projectedY = minY + (minY - projectedY);
        if (projectedY > maxY) projectedY = maxY - (projectedY - maxY);
      }

      return projectedY;
    };

    const bounceFromPaddle = (paddleY: number, fromLeft: boolean) => {
      const paddleCenter = paddleY + PADDLE_HEIGHT / 2;
      const offset = clamp(
        (state.ball.y - paddleCenter) / (PADDLE_HEIGHT / 2),
        -1,
        1,
      );
      const angle = offset * MAX_BOUNCE_ANGLE;

      state.ball.vx = Math.cos(angle) * (fromLeft ? 1 : -1);
      state.ball.vy = Math.sin(angle);
      state.ball.speed = Math.min(
        state.ball.speed + BALL_ACCELERATION,
        MAX_BALL_SPEED,
      );
      state.ball.x = fromLeft
        ? PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS
        : WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_RADIUS;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
      }
      if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        keys.up = true;
      }
      if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        keys.down = true;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        keys.up = false;
      }
      if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        keys.down = false;
      }
    };

    const update = (delta: number, now: number) => {
      if (state.winner) return;

      const movement = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
      state.playerY = clamp(
        state.playerY + movement * PLAYER_SPEED * delta,
        0,
        HEIGHT - PADDLE_HEIGHT,
      );

      const aiTarget =
        predictBallY() - PADDLE_HEIGHT / 2 + Math.sin(now / 220) * 8;
      const aiDelta = clamp(
        aiTarget - state.aiY,
        -AI_SPEED * delta,
        AI_SPEED * delta,
      );
      state.aiY = clamp(state.aiY + aiDelta, 0, HEIGHT - PADDLE_HEIGHT);

      if (!state.ball.active) {
        if (now >= state.ball.serveAt) state.ball.active = true;
        return;
      }

      state.ball.x += state.ball.vx * state.ball.speed * delta;
      state.ball.y += state.ball.vy * state.ball.speed * delta;

      if (state.ball.y - BALL_RADIUS <= 0) {
        state.ball.y = BALL_RADIUS;
        state.ball.vy = Math.abs(state.ball.vy);
      }
      if (state.ball.y + BALL_RADIUS >= HEIGHT) {
        state.ball.y = HEIGHT - BALL_RADIUS;
        state.ball.vy = -Math.abs(state.ball.vy);
      }

      const playerLeft = PADDLE_MARGIN;
      const playerRight = playerLeft + PADDLE_WIDTH;
      const aiLeft = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
      const aiRight = WIDTH - PADDLE_MARGIN;

      const hitsPlayer =
        state.ball.vx < 0 &&
        state.ball.x - BALL_RADIUS <= playerRight &&
        state.ball.x + BALL_RADIUS >= playerLeft &&
        state.ball.y >= state.playerY &&
        state.ball.y <= state.playerY + PADDLE_HEIGHT;

      if (hitsPlayer) bounceFromPaddle(state.playerY, true);

      const hitsAI =
        state.ball.vx > 0 &&
        state.ball.x + BALL_RADIUS >= aiLeft &&
        state.ball.x - BALL_RADIUS <= aiRight &&
        state.ball.y >= state.aiY &&
        state.ball.y <= state.aiY + PADDLE_HEIGHT;

      if (hitsAI) bounceFromPaddle(state.aiY, false);

      if (state.ball.x < -BALL_RADIUS) handleScore("ai", now);
      if (state.ball.x > WIDTH + BALL_RADIUS) handleScore("player", now);
    };

    const draw = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      bg.addColorStop(0, "#060915");
      bg.addColorStop(1, "#010208");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2, 12);
      ctx.lineTo(WIDTH / 2, HEIGHT - 12);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(PADDLE_MARGIN, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(
        WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
        state.aiY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
      );

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "600 14px monospace";
      ctx.textAlign = "center";
      if (!state.winner && !state.ball.active) {
        ctx.fillText("Next serve...", WIDTH / 2, HEIGHT / 2 - 30);
      }
    };

    const frame = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      update(delta, now);
      draw();
      frameRef.current = requestAnimationFrame(frame);
    };

    onScoreChange({ ...state.score });
    resetBall(Math.random() < 0.5 ? -1 : 1, lastTime);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    frameRef.current = requestAnimationFrame(frame);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [restartSignal, maxScore, onGameEnd, onScoreChange]);

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      className="w-full h-auto max-w-[960px] rounded-xl border border-white/20"
    />
  );
}
