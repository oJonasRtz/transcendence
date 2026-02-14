import * as ex from "excalibur";
import { gameState } from "../globals";

type TrailPoint = {
  x: number;
  y: number;
  alpha: number;
  radius: number;
};

type BurstRing = {
  x: number;
  y: number;
  alpha: number;
  radius: number;
  color: ex.Color;
};

const DEFAULT_ORB = ex.Color.White;

export class EffectsOverlay extends ex.ScreenElement {
  private engine: ex.Engine;
  private trail: TrailPoint[] = [];
  private bursts: BurstRing[] = [];
  private lastScores = {
    1: 0,
    2: 0,
  };

  constructor(engine: ex.Engine) {
    super({
      z: 2000,
    });
    this.engine = engine;
  }

  private getColor(hex: string | undefined, alpha: number): ex.Color {
    if (!hex) return new ex.Color(255, 255, 255, alpha);

    try {
      const raw = ex.Color.fromHex(hex);
      return new ex.Color(raw.r, raw.g, raw.b, alpha);
    } catch (_error) {
      return new ex.Color(DEFAULT_ORB.r, DEFAULT_ORB.g, DEFAULT_ORB.b, alpha);
    }
  }

  private updateTrail() {
    const ball = gameState.getBall();
    if (ball.exist) {
      this.trail.push({
        x: ball.vector.x,
        y: ball.vector.y,
        alpha: 0.35,
        radius: 7,
      });
      if (this.trail.length > 24) this.trail.shift();
    }

    this.trail = this.trail
      .map((point) => ({
        ...point,
        alpha: point.alpha * 0.92,
        radius: point.radius * 0.98,
      }))
      .filter((point) => point.alpha > 0.03);
  }

  private updateBursts() {
    const players = gameState.getPlayers();
    const leftScored = players[1].score > this.lastScores[1];
    const rightScored = players[2].score > this.lastScores[2];
    if (leftScored || rightScored) {
      const side: 1 | 2 = leftScored ? 1 : 2;
      const x = side === 1 ? this.engine.drawWidth * 0.24 : this.engine.drawWidth * 0.76;
      const color = side === 1
        ? new ex.Color(59, 130, 246, 0.48)
        : new ex.Color(239, 68, 68, 0.48);

      this.bursts.push({
        x,
        y: this.engine.drawHeight / 2,
        alpha: 0.48,
        radius: 28,
        color,
      });
    }

    this.lastScores[1] = players[1].score;
    this.lastScores[2] = players[2].score;

    this.bursts = this.bursts
      .map((burst) => ({
        ...burst,
        radius: burst.radius + 8,
        alpha: burst.alpha * 0.9,
        color: new ex.Color(burst.color.r, burst.color.g, burst.color.b, burst.alpha * 0.9),
      }))
      .filter((burst) => burst.alpha > 0.04);
  }

  onPreUpdate(): void {
    this.updateTrail();
    this.updateBursts();
  }

  onPreDraw(ctx: any): void {
    this.trail.forEach((point) => {
      ctx.drawCircle(
        ex.vec(point.x, point.y),
        point.radius,
        new ex.Color(255, 255, 255, point.alpha)
      );
    });

    const powerUp = gameState.getPowerUp();
    if (powerUp) {
      const pulse = 1 + Math.sin(performance.now() / 180) * 0.22;
      const outer = this.getColor(powerUp.color, 0.24);
      const core = this.getColor(powerUp.color, 0.9);
      ctx.drawCircle(
        ex.vec(powerUp.position.x, powerUp.position.y),
        powerUp.radius * pulse,
        outer
      );
      ctx.drawCircle(
        ex.vec(powerUp.position.x, powerUp.position.y),
        powerUp.radius * 0.6,
        core
      );
    }

    this.bursts.forEach((burst) => {
      ctx.drawCircle(
        ex.vec(burst.x, burst.y),
        burst.radius,
        burst.color
      );
    });
  }
}
