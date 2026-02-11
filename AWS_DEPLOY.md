# AWS Deployment Guide

Simple guide for deploying transcendence on AWS EC2 with Let's Encrypt.

## Prerequisites

- AWS EC2 instance (Ubuntu)
- Elastic IP associated to the EC2 instance
- Domain name pointing to the Elastic IP
- Ports 80, 443 open in security group
- SSH access to the instance

## Elastic IP + DNS

1. In AWS EC2, allocate an Elastic IP and associate it with your instance.
2. In your DNS provider, set:
   - `A` record `@` -> your Elastic IP
   - `A` record `www` -> your Elastic IP (recommended)
3. Verify DNS:

```bash
dig transcendence42.xyz +short
dig www.transcendence42.xyz +short
```

## Initial Setup

### 1. Connect to VM

```bash
ssh -i /path/to/key.pem ubuntu@your-ip-or-domain
```

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin -y

# Install Make
sudo apt install make -y

# Log out and back in for docker group to take effect
exit
```

### 3. Clone Repository

```bash
ssh -i /path/to/key.pem ubuntu@your-ip-or-domain

git clone <repository-url>
cd transcendence
```

### 3.1 One-Command Deploy (Recommended)

```bash
# Uses default domain/email configured in script:
./scripts/deploy-aws.sh

# Explicit values:
./scripts/deploy-aws.sh \
  --domain transcendence42.xyz \
  --alt-domain www.transcendence42.xyz \
  --email rflseijiueno@gmail.com
```

### 4. Generate Let's Encrypt Certificates

```bash
# First time only - requires your domain and email.
# By default this issues certs for DOMAIN and ALT_DOMAIN=www.DOMAIN.
make aws-cert-init DOMAIN=your-domain.com EMAIL=rflseijiueno@gmail.com

# Example:
# make aws-cert-init DOMAIN=transcendence42.xyz EMAIL=rflseijiueno@gmail.com
# To disable www:
# make aws-cert-init DOMAIN=transcendence42.xyz ALT_DOMAIN=
```

This will:
- Start services with internal self-signed TLS
- Complete HTTP-01 challenge via nginx webroot
- Request certificates from Let's Encrypt
- Copy certificates to shared/ssl-public/
- Keep service-to-service TLS on shared/ssl/

### 5. Deploy Services

```bash
make aws
```

This will:
- Build all Docker images
- Start all services with Let's Encrypt certificates
- Access at https://your-domain.com

## Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
make aws
```

## Certificate Renewal

Let's Encrypt certificates expire every 90 days.

```bash
# Manual renewal
make aws-cert-renew DOMAIN=transcendence42.xyz
```

Renewal uses the webroot challenge and does not stop nginx.

Or add to crontab for automatic renewal:

```bash
# Edit crontab
crontab -e

# Add this line (runs monthly at 3am on day 1)
0 3 1 * * cd /home/ubuntu/transcendence && make aws-cert-renew DOMAIN=transcendence42.xyz >> /var/log/certbot-renew.log 2>&1
```

## Troubleshooting

### Certificate generation fails

```bash
# Check if ports 80/443 are open
sudo ufw status

# Check if domain points to this IP
dig your-domain.com +short

# Check nginx logs
docker compose logs nginx
```

### Services won't start

```bash
# Check all services status
docker compose ps

# View logs
docker compose logs -f

# Check disk space
df -h

# Check memory
free -h
```

### Certificate not found error

```bash
# Verify certificate exists
ls -la ./shared/letsencrypt/live/your-domain.com/

# Re-run certificate init
make aws-cert-init DOMAIN=your-domain.com EMAIL=your-email@example.com
```

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make aws-cert-init` | Generate Let's Encrypt certificates (first time) |
| `make aws-cert-renew` | Renew Let's Encrypt certificates |
| `make aws` | Deploy with Let's Encrypt certificates |
| `make down` | Stop all services |
| `make build` | Build all images |
| `make logs` | View all logs |

## Architecture

Same as local deployment, but with:
- **Let's Encrypt certificates** instead of self-signed
- **Public domain** (e.g., transcendence42.xyz)
- **Production-ready HTTPS**

## Current Deployment

- **Domain**: transcendence42.xyz
- **Elastic IP**: 13.59.195.11
- **VM**: AWS EC2 Ubuntu
