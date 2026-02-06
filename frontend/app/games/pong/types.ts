export type StartType = {
  name: string;
  matchId: number;
  playerId: number | string;
};

export type InputType = {
  id: number;
  matchId: number;
  type: string;
  up: boolean;
  down: boolean;
};
