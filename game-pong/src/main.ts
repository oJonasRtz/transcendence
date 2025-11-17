import { Game } from "./game/game.class";
import { connection, gameState, identity } from "./globals";
import type { StartType } from "./types";

const temp = {
  1: {
    name: "Raltz",
    playerId: 4002,
  },
  2: {
    name: "Kirlia",
    playerId: 8922,
  },
};

connection.connect();

function waitGameStart(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      const {gameStarted} = gameState.getGame();
      if (gameStarted)
        resolve();
      else
        requestAnimationFrame(check);
    }
    check();
  })
}

async function startPong(data: StartType): Promise<void> {
  gameState.setIdentity(data);
  await waitGameStart();
  const game = new Game();

  game.start();
}

(async() => {
  const match = Number(prompt("match id:"));
  const id: 1 | 2 = Number(prompt("you are player (1 or 2):"));

  await startPong({
    matchId: match,
    name: temp[id].name,
    playerId: temp[id].playerId,
  });
})();
