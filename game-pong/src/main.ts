import { Game } from "./view/game.class";
import { connection, gameState } from "./globals";
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

export function waitGameStart(): Promise<void> {
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

//Puxar as infos via url futuramente, essa é so pra teste
(async() => {
  const match = Number(prompt("match id:"));
  let temp_id: number = Number(prompt("you are player (1 or 2):"));

  
  const id = temp_id as 1 | 2;

  await startPong({
    matchId: match,
    name: temp[id].name,
    playerId: temp[id].playerId,
  });
})();
