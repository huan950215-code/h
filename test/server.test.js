import test from "node:test";
import assert from "node:assert/strict";
import { startServer } from "../server.js";

const fixtureRoot = new URL("./fixtures/site", import.meta.url).pathname;

async function setupServer(root = fixtureRoot) {
  const { server, url } = await startServer({ host: "127.0.0.1", port: 0, root });

  const close = () =>
    new Promise((resolve) => {
      server.close(() => resolve());
    });

  return { server, url, close };
}

test("serves index.html with html content-type", async (t) => {
  const { url, close } = await setupServer();
  t.after(close);

  const response = await fetch(`${url}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const body = await response.text();
  assert.match(body, /Fixture Home/);
});

test("serves static assets with matching mime", async (t) => {
  const { url, close } = await setupServer();
  t.after(close);

  const response = await fetch(`${url}/styles.css`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/css/);
  const body = await response.text();
  assert.match(body, /font-family/);
});

test("redirects directory requests to root", async (t) => {
  const { url, close } = await setupServer();
  t.after(close);

  const response = await fetch(`${url}/empty-folder`, { redirect: "manual" });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "/");
});

test("returns 404 for missing files", async (t) => {
  const { url, close } = await setupServer();
  t.after(close);

  const response = await fetch(`${url}/missing-file`);
  assert.equal(response.status, 404);
  const body = await response.text();
  assert.match(body, /未找到资源/);
});
