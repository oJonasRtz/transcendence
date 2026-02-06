# AWS Deployment Guide

Simple guide for deploying transcendence on AWS EC2 with Let's Encrypt.

## Prerequisites

- AWS EC2 instance (Ubuntu)
- Domain name pointing to the instance IP
- Ports 80, 443 open in security group
- SSH access to the instance

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

### 4. Generate Let's Encrypt Certificates

```bash
# First time only - requires your domain and email
make aws-cert-init DOMAIN=your-domain.com EMAIL=your-email@example.com

# Example:
# make aws-cert-init DOMAIN=transcendence42.xyz EMAIL=admin@transcendence42.xyz
```

This will:
- Stop nginx temporarily
- Request certificates from Let's Encrypt
- Copy certificates to shared/ssl-public/
- Restart nginx

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
make aws-cert-renew
```

Or add to crontab for automatic renewal:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 60 days at 3am)
0 3 */60 * * cd /home/ubuntu/transcendence && make aws-cert-renew >> /var/log/certbot-renew.log 2>&1
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
- **IP**: 13.59.195.11
- **VM**: AWS EC2 Ubuntu
