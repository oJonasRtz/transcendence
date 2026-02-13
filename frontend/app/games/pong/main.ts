import { Game } from "./view/game.class";
import { connection, gameState } from "./globals";
import type { StartType } from "./types";
import { ScoreType } from "@/app/ui/dashboard/pong-game";

// const temp = {
//   1: {
//     name: "cccc",
//     playerId: "acf1b908-94ca-43dc-a74d-25b77199f86b",
//   },
//   2: {
//     name: "dddd",
//     playerId: "c856b7b3-c065-49b5-986f-4bdff97ee5a4",
//   },
// };

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

/**
 * Starts the Pong game with the provided player data.
 * @param data - The player data including {matchId, name, playerId}.
 * @param {string} data.name - The name of the player.
 * @param {number} data.matchId - The match identification number.
 * @param {number|string} data.playerId - The player's identification number.
 * @param container - The HTML container where the game will be rendered.
 * @returns Wait a promisse till the game ends.
*/
export async function startPong(data: StartType, container: HTMLElement, setScore: (score: ScoreType) => void): Promise<void> {
  showDisconnectScreen(container);
  gameState.setIdentity(data);
  gameState.setSetScore(setScore);
  await waitGameStart();
  hideDisconnectScreen();

  const game = new Game(container);
  await game.start();
}

let disconnectScreen: HTMLDivElement | null = null;

export function showDisconnectScreen(container: HTMLElement) {
	if (disconnectScreen) return;

	disconnectScreen = document.createElement('div');
	disconnectScreen.id = 'disconnect-screen';
	disconnectScreen.style.position = 'absolute';
	disconnectScreen.style.top = '0';
	disconnectScreen.style.left = '0';
	disconnectScreen.style.width = '100%';
	disconnectScreen.style.height = '100%';
	disconnectScreen.style.background = '#000';
	disconnectScreen.style.display = 'flex';
	disconnectScreen.style.alignItems = 'center';
	disconnectScreen.style.justifyContent = 'center';
	disconnectScreen.style.gap = '15px';
	disconnectScreen.style.zIndex = '10';

	// bolinhas
	for (let i = 0; i < 3; i++) {
		const dot = document.createElement('div');
		dot.style.width = '20px';
		dot.style.height = '20px';
		dot.style.borderRadius = '50%';
		dot.style.background = 'white';
		dot.style.border = '2px solid black';
		dot.style.animation = `bounce 0.6s ${i * 0.2}s infinite ease-in-out`;
		disconnectScreen.appendChild(dot);
	}

	// garante que o container possa posicionar filhos absolutos
	container.style.position = 'relative';
	container.appendChild(disconnectScreen);

	const style = document.createElement('style');
	style.innerHTML = `
		@keyframes bounce {
			0%, 80%, 100% { transform: translateY(0); }
			40% { transform: translateY(-20px); }
		}
	`;
	document.head.appendChild(style);
}


export function hideDisconnectScreen() {
	if (!disconnectScreen) return;
	disconnectScreen.remove();
	disconnectScreen = null;
}



//Puxar as infos via url futuramente, essa é so pra teste
// (async() => {
//   const match = Number(prompt("match id:"));
//   let temp_id: number = Number(prompt("you are player (1 or 2):"));

  
//   const id = temp_id as 1 | 2;

//   await startPong({
//     matchId: match,
//     name: temp[id].name,
//     playerId: temp[id].playerId,
//   });
// })();
