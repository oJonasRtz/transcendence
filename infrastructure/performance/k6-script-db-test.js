import http from 'k6/http';
import { sleep } from 'k6';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

export const options = {
  vus: 40,
  duration: '10s',
};

export default function() {
  // Testa endpoint raiz
  let resGet = http.get('http://backend:3000/');
  expect.soft(resGet.status).toBe(200);

  // Testa health
  let resHealth = http.get('http://backend:3000/health');
  expect.soft(resHealth.status).toBe(200);

  // Testa health do banco
  let resDbHealth = http.get('http://backend:3000/api/health/db');
  expect.soft(resDbHealth.status).toBe(200);

  // Cria usuário
  let userPayload = JSON.stringify({
    username: `user${__VU}_${__ITER}`,
    email: `user${__VU}_${__ITER}@test.com`,
    password: "12345678"
  });
  let resUser = http.post('http://backend:3000/api/users/register', userPayload, { headers: { 'Content-Type': 'application/json' } });
  expect.soft([201, 409, 400, 500]).toContain(resUser.status); // 201: criado, 409: conflito, 400: inválido, 500: erro

  // Lista usuários
  let resListUsers = http.get('http://backend:3000/api/users');
  expect.soft(resListUsers.status).toBe(200);

  // Cria torneio
  let tournamentPayload = JSON.stringify({
    name: `Torneio${__VU}_${__ITER}`,
    maxParticipants: 8
  });
  let resTournament = http.post('http://backend:3000/api/tournaments', tournamentPayload, { headers: { 'Content-Type': 'application/json' } });
  expect.soft([201, 400, 500]).toContain(resTournament.status);

  // Lista torneios
  let resListTournaments = http.get('http://backend:3000/api/tournaments');
  expect.soft(resListTournaments.status).toBe(200);

  // Testa endpoint inexistente
  let resWrong = http.get('http://backend:3000/wrong');
  expect.soft(resWrong.status).toBe(404);

  sleep(1);
}
