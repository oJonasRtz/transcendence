import http from 'k6/http';
import { sleep } from 'k6';
import { expect } from "https://jslib.k6.io/k6-testing/0.5.0/index.js";

export const options = {
  vus: 30,
  duration: '20s',
};

export default function() {
  let resGet = http.get('http://backend:3000/');
  let resPost = http.post('http://backend:3000/', JSON.stringify({ name: 'test' }), { headers: { 'Content-Type': 'application/json' } });
  let resPut = http.put('http://backend:3000/', JSON.stringify({ name: 'test' }), { headers: { 'Content-Type': 'application/json' } });
  let resHealth = http.get('http://backend:3000/health');
  let resWrong = http.get('http://backend:3000/wrong');
  let resDelete = http.del('http://backend:3000/');
  expect.soft(resGet.status).toBe(200);
  expect.soft(resPost.status).toBe(404);
  expect.soft(resPut.status).toBe(404);
  expect.soft(resHealth.status).toBe(200);
  expect.soft(resWrong.status).toBe(404);
  expect.soft(resDelete.status).toBe(404);
  sleep(1);
}
