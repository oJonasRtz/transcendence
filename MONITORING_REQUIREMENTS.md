# Monitoring Requirements (Prometheus + Grafana)

This document explains how the project meets the monitoring requirements and how to test each one end-to-end.

## Prerequisites

- Docker + Docker Compose available.
- Services running via the root `docker-compose.yml`.
- If you haven’t already, create `monitoring/.grafana-password.txt` (see `monitoring/.grafana-password.txt.example`) with:
  - `GRAFANA_ADMIN_PASSWORD=your-password-here`

Start (or rebuild) the stack:

```bash
docker compose up -d --build
```

---

## 1) Set up Prometheus to collect metrics

### Why this requirement is met

- Prometheus is included as a service in `docker-compose.yml` and runs on the `transcendence` network.
- Prometheus is configured via `monitoring/prometheus/prometheus.yml` with:
  - Global scrape + evaluation intervals
  - Scrape targets for infrastructure exporters and application services
  - Rule files for alerting

### How to test

1) Open Prometheus UI:

```bash
curl -fsS http://localhost:9090/-/healthy
```

2) Verify Prometheus is scraping targets:

- Visit `http://localhost:9090/targets`
- Expected: most targets show **UP** (at least `prometheus`, `node-exporter`, `cadvisor`, `blackbox-exporter`, and your services if running).

3) Verify application metrics exist (example query):

- Visit `http://localhost:9090/graph` and run:
  - `http_requests_total`
  - `http_request_duration_seconds_count`
  - `process_uptime_seconds`

Expected: time series should appear for the services that have received traffic.

---

## 2) Configure exporters and integrations

### Why this requirement is met

The stack includes exporters/integrations commonly required for a complete monitoring setup:

- **Node Exporter** (host/system metrics): `node-exporter` in `docker-compose.yml`
- **cAdvisor** (container metrics): `cadvisor` in `docker-compose.yml`
- **Blackbox Exporter** (endpoint probing): `blackbox-exporter` in `docker-compose.yml` with config `monitoring/blackbox/blackbox.yml`

Additionally, the project integrates application metrics by exposing `/metrics` endpoints in the services:

- `api-gateway` (Fastify)
- `auth-service` (Fastify)
- `users-service` (Fastify)
- `chat-service` (Fastify)
- `match-service` (Fastify)
- `game-server` (HTTPS server providing `/metrics` + WS metrics)

Prometheus scrapes those service endpoints over HTTPS (self-signed) using `tls_config.insecure_skip_verify: true`.

### How to test

1) Verify exporter targets are UP:

- Visit `http://localhost:9090/targets`
- Expected **UP**:
  - `node-exporter`
  - `cadvisor`
  - `blackbox-exporter`

2) Verify blackbox probe jobs are working:

- In `http://localhost:9090/targets`, check:
  - `blackbox-http` (e.g. `http://nginx:80`)
  - `blackbox-https` (e.g. `https://nginx:443`, `https://api-gateway:3000`)
- Expected: probes show **UP** for reachable endpoints.

3) Verify application `/metrics` endpoints:

From your host (example: api-gateway is published on port 3000):

```bash
curl -k https://localhost:3000/metrics | head
```

Expected: Prometheus text format output including metrics like `process_uptime_seconds` and `http_requests_total`.

---

## 3) Create custom Grafana dashboards

### Why this requirement is met

- Grafana is included as a service in `docker-compose.yml`.
- Datasource provisioning is configured in:
  - `monitoring/grafana/provisioning/datasources/prometheus.yml`
- Dashboard provisioning is configured in:
  - `monitoring/grafana/provisioning/dashboards/dashboard.yml`
- A custom dashboard JSON is included and auto-provisioned:
  - `monitoring/grafana/provisioning/dashboards/transcendence-overview.json`

### How to test

1) Open Grafana (through nginx subpath):

- Visit `https://localhost/grafana/`

2) Log in:

- Username: `admin`
- Password: value from `monitoring/.grafana-password.txt` (`GRAFANA_ADMIN_PASSWORD`)

3) Confirm datasource + dashboard:

- Go to **Connections → Data sources** and verify **Prometheus** exists and is healthy.
- Go to **Dashboards** and open **Transcendence Overview**.

Expected: panels populate once Prometheus has scraped metrics and the services have traffic.

---

## 4) Set up alerting rules

### Why this requirement is met

- Prometheus loads alert rules from:
  - `monitoring/prometheus/rules/alerts.yml`
- Prometheus is configured to send alerts to Alertmanager:
  - `monitoring/prometheus/prometheus.yml` (`alerting.alertmanagers`)
- Alertmanager is included as a service:
  - `docker-compose.yml`
  - Config: `monitoring/alertmanager/alertmanager.yml`

Note: Alertmanager is configured to deliver alerts to a local webhook receiver (`alert-receiver`) so you can prove delivery without external dependencies. Integrating email/Slack/webhooks is a follow-up.

### How to test

1) Verify rules are loaded:

- Visit `http://localhost:9090/rules`
- Expected: rule groups from `alerts.yml` are listed.

2) Trigger an alert (example: stop a service to make `up == 0` fire):

```bash
docker compose stop users-service
```

3) Check active alerts:

- Visit `http://localhost:9090/alerts`
- Expected: an alert like `ServiceDown` should become **FIRING** after its `for:` duration.

4) Confirm Alertmanager receives it:

- Visit `http://localhost:9093/`
- Expected: the alert appears in Alertmanager UI.

5) Confirm alert delivery (local webhook receiver):

```bash
docker compose logs -f alert-receiver
```

Expected: log lines like `received N alerts` and the alert names/status.

Restart the service:

```bash
docker compose start users-service
```

---

## 5) Secure access to Grafana

### Why this requirement is met

- Grafana is not published directly to the host (no `ports:` section); it is accessed via nginx at the `/grafana/` subpath.
- Access goes through HTTPS termination in nginx using the project certificates.
- Grafana authentication hardening is configured via environment variables in `docker-compose.yml`, including:
  - Admin password from `GRAFANA_ADMIN_PASSWORD`
  - Sign-up disabled
  - Anonymous access disabled
  - Secure cookies enabled
  - Serve-from-subpath enabled for `/grafana/`

### How to test

1) Confirm Grafana is not directly exposed:

```bash
docker compose ps
```

Expected: `grafana` shows `3000/tcp` but no host-published port mapping like `0.0.0.0:3000->3000/tcp`.

2) Confirm access works only via nginx:

- Visit `https://localhost/grafana/`
- Expected: Grafana login page.

3) Confirm anonymous access is disabled:

- Open a private/incognito window and visit `https://localhost/grafana/`
- Expected: login required (no dashboard without auth).
