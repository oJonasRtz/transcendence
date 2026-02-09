import { Client } from "./Client.class.js";
import { Connection } from "./Connection.class.js";
import { EventEmitter } from "events";
import { data, gameServer } from "../app.js";

const MINPTS = 15;
const MAXGAINPTS = 25;
const MAXLOSSPTS = 20;

const __MIN_RANK_POSSIBLE__ = -30;
const __MAX_RANK_POSSIBLE__ = Number.MAX_SAFE_INTEGER - 200;

export class Lobby extends EventEmitter {
  #clients = [];
  #ids = {
    match_id: new Set(),
    Lobby_id: null,
  };
  #valid_types = ["RANKED", "TOURNAMENT"];
  type = null;
  #maxPlayers = {
    RANKED: 2,
    TOURNAMENT: 4,
  };
  #end_game = false;
  #tournament = {
    round: 1,
    games: [],
    players: [], // {client, wins, losses}
    activeMatches: new Map(),
    timer: null,
  }

  constructor({ type, clients = [], id }) {
    super();
    if (
      !this.#valid_types.includes(type) ||
      !id ||
      !Array.isArray(clients) ||
      clients.length === 0 ||
      !clients.every((c) => c instanceof Client)
    )
      throw new Error("INVALID_FORMAT");

    this.type = type;
    this.#clients = clients;
    this.#ids.Lobby_id = id;

    try {
      this.#manageMatch();
    } catch (error) {
      console.error("Lobby: Error managing match:", error.message);
    }
  }
  async #newMatch({ players }) {
    if (!gameServer) throw new Error("NO_GAME_SERVER_AVAILABLE");

    const match_id = await gameServer.newMatch(players, 2, "PONG", this);
    this.#ids.match_id.add(match_id);
    return match_id;
  }

  #createGamesFromPlayers(players) {
    const games = [];

    for (let i = 0; i < players.length; i += 2) {
      games.push({
        players: [players[i], players[i + 1]],
        match_id: null,
        finished: false,
      });
    }

    return games;
  }

  #serializeGames(games) {}

  async #startTournamentRound() {
    const games = this.#tournament.games;

    for (const game of games) {
      const players = {
        1: { name: game.players[0].client.name, id: game.players[0].client.id },
        2: { name: game.players[1].client.name, id: game.players[1].client.id },
      };

      const match_id = await this.#newMatch({ players });
      game.match_id = match_id;
      this.#tournament.activeMatches.set(match_id, game);

      game.players.forEach((c) => c.client.match_id = match_id);
      game.players.forEach((c) => c.client.send({
        type: "MATCH_FOUND",
        match_id,
        skip: false
      }));
    }
  }

  async #setUpTournament() {
    const timeout = 2; // minutes
    
    this.#tournament.players = this.#clients.map((c) => ({
      client: c,
      wins: 0,
      losses: 0
    }));

    this.#tournament.round = 1;
    this.#tournament.games = this.#createGamesFromPlayers(this.#tournament.players);

    this.#broadcast({
      type: 'TOURNAMENT_BRACKETS',
      round: this.#tournament.round,
      games: this.#serializeGames(this.#tournament.games),
      timeout_in_minutes: timeout
    });

    this.#tournament.timer = setTimeout(async () => {
      await this.#startTournamentRound();
    }, timeout * 60 * 1000);
  }

  async #manageMatch() {
    if (!gameServer) throw new Error("NO_GAME_SERVER_AVAILABLE");

    switch (this.type) {
      case "RANKED":
        const players = {};
        this.#clients.forEach((client, index) => {
          {
            players[index + 1] = { name: client.name, id: client.id };
          }
        });
        const match_id = await this.#newMatch({ players });
        this.#clients.forEach((c) => c.match_id = match_id);
        console.log(`match ${match_id} created for clients ${this.#clients.map(c => c.name).join(", ")}`);
        this.#broadcast({ type: "MATCH_FOUND", match_id, skip: false });
        break;
      case "TOURNAMENT":
        await this.#setUpTournament();
        break;
    }
  }

  async waitEnd() {
    if (this.#end_game) return;

    return new Promise((resolve) => {
      this.once("END_GAME", resolve);
    });
  }

  get isFull() {
    return this.#clients.length === this.#maxPlayers[this.type];
  }

  async end_game({ setter, match_id, stats }, timeout = false) {
    if (!(setter instanceof Connection)) throw new Error("PERMISSION_DENIED");

    if (this.#end_game) return;

    if (!timeout && (!stats || !stats.players))
      throw new Error("INVALID_STATS");

    if (!this.#ids.match_id.has(match_id)) throw new Error("INVALID_MATCH_ID");

    this.#ids.match_id.delete(match_id);

    switch (this.type) {
      case "RANKED":
        this.#end_game = true;
        if (timeout) {
          this.#broadcast({ type: "MATCH_TIMEOUT", match_id });
          this.emit("END_GAME");
          return;
        }
        const p = stats.players;
        const winner = Object.values(p).find((player) => player.winner).id;
        const calc = this.#calculateRank({
          score1: p[1].score,
          score2: p[2].score,
        });

        for (const key in p) {
          const {tier, rank_points} = await data.sendRequest("/getRank", { user_id: p[key].id });

          p[key].tier = tier;
          p[key].rank_points = rank_points;
        }
        stats.game_type = this.type;

        for (const c of this.#clients) {
          let rank = c.rank;
          const isWinner = c.id === winner;
          const pts = isWinner ? calc.gain : calc.loss;
          const xpPts = this.#calculateXP(isWinner ? 1 : 2);

          rank += pts;
          if (rank > __MAX_RANK_POSSIBLE__) rank = __MAX_RANK_POSSIBLE__;
          if (rank < __MIN_RANK_POSSIBLE__) rank = __MIN_RANK_POSSIBLE__;
          c.rank = rank;
          await data.sendRequest("/setRank", { user_id: c.id, rank: pts });
          await data.sendRequest("/setUserExperience", {
            user_id: c.id,
            experience: xpPts,
          });

          const {tier, rank_points} = await data.sendRequest("/getRank", { user_id: c.id });
          const {level, experience_points} = await data.sendRequest('getUserInformation', { user_id: c.id });

          c.send({
            type: 'MATCH_RESULT',
            match_id,
            result: isWinner ? 'WIN' : 'LOSS',
            pts,
            rank_points,
            tier,
            level,
            experience_points,
            experienceGained: xpPts,
            stats
          })
        }
        this.emit("END_GAME");
        break;
    }

    await data.sendRequest("/addHistory", { stats });
  }

  #broadcast(message) {
    this.#clients.forEach((client) => {
      client.send(message);
    });
  }

  #calculateRank({ score1, score2 }) {
    const scale = Math.max(score1, score2);
    const diff = Math.abs(score1 - score2);
    const ratio = Math.min((diff === 1 ? 0 : diff) / scale, 1);

    const gain = Math.round(MINPTS + (MAXGAINPTS - MINPTS) * ratio);
    const loss = -Math.round(MINPTS + (MAXLOSSPTS - MINPTS) * ratio);

    return { gain, loss };
  }

  /**
   * Calculates XP based on position and match type
   *
   * @param {number} position - The finishing position of the player
   * @returns {number} - The calculated XP
   */
  #calculateXP(position) {
    const BASE_XP = 50;
    const WIN_BONUS = 30;
    const TOURNAMENT_BONUS = 20;

    const isTournament = this.type === "TOURNAMENT";

    if (isTournament)
      return (BASE_XP + (position === 1) * WIN_BONUS + TOURNAMENT_BONUS) * 2;

    return BASE_XP + (position === 1) * WIN_BONUS;
  }
}
