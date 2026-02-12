# AWS VM Setup Checklist

Quick checklist of what needs to be configured on the AWS VM before deployment.

## ✅ Pre-Deployment Checklist

### 1. System Prerequisites

```bash
# Check if Docker is installed
docker --version
# Should show: Docker version 20.10+ or newer

# Check if Docker Compose v2 is installed
docker compose version
# Should show: Docker Compose version v2.x.x or newer

# Check if Make is installed
make --version
# Should show: GNU Make 4.x or newer

# Check if Git is installed
git --version
# Should show: git version 2.x or newer
```

**If missing, install:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose plugin (v2)
sudo apt install docker-compose-plugin -y

# Install Make and Git
sudo apt install make git -y

# Log out and back in for docker group to take effect
exit
```

### 2. Firewall / Security Group

**Required ports:**

| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH access |
| 80 | TCP | HTTP (for Let's Encrypt ACME challenge) |
| 443 | TCP | HTTPS (main application) |

**Check AWS Security Group:**
- Go to EC2 → Security Groups
- Verify inbound rules allow:
  - Port 22 from your IP (SSH)
  - Port 80 from 0.0.0.0/0 (HTTP)
  - Port 443 from 0.0.0.0/0 (HTTPS)

**Check local firewall (ufw):**

```bash
# Check firewall status
sudo ufw status

# If ufw is active, allow ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 3. DNS Configuration

**Verify domain points to the Elastic IP associated to the VM:**

```bash
# From your local machine
dig transcendence42.xyz +short
# Should return: 13.59.195.11

# Or use nslookup
nslookup transcendence42.xyz
# Should return: 13.59.195.11
```

**If not configured:**
- Go to your domain registrar (e.g., Hostinger, GoDaddy, etc.)
- Add/Update A records:
  - Type: `A`
  - Name: `@`
  - Value: `13.59.195.11`
  - TTL: `3600` (or default)
  - Type: `A`
  - Name: `www`
  - Value: `13.59.195.11`
  - TTL: `3600` (or default)

### 4. System Resources

```bash
# Check available disk space (need 10GB+ free)
df -h /

# Check available memory (need 4GB+ recommended)
free -h

# Check CPU
nproc
# Should show at least 2 cores
```

### 5. User Permissions

```bash
# Verify user is in docker group
groups
# Should include 'docker'

# Test docker without sudo
docker ps
# Should work without "permission denied"
```

### 6. Directory Setup (Optional)

```bash
# Create deployment directory
mkdir -p /opt/transcendence
cd /opt/transcendence

# Or use home directory
cd ~
```

## 🚀 Deployment Flow

Once everything is verified:

```bash
# 1. Clone repository
git clone <repository-url>
cd transcendence

# 2. One command deploy (recommended)
./scripts/deploy-aws.sh \
  --domain transcendence42.xyz \
  --alt-domain www.transcendence42.xyz \
  --email rflseijiueno@gmail.com

# Optional: skip cron install if you manage renewal elsewhere
# ./scripts/deploy-aws.sh --skip-cron

# Manual equivalent:
# 2. Generate Let's Encrypt certificates (first time only)
make aws-cert-init DOMAIN=transcendence42.xyz EMAIL=rflseijiueno@gmail.com

# 3. Deploy (automatically generates secrets if .env doesn't exist)
make aws

# 4. Verify
curl -I https://transcendence42.xyz
# Should return: HTTP/2 200
```

**Note:** The `make aws` command automatically:
- Generates `.env` with random JWT_SECRET and GRAFANA_ADMIN_PASSWORD (if not exists)
- Keeps internal service TLS in `shared/ssl` and mounts Let's Encrypt certs to nginx from `shared/ssl-public`
- Persists `PUBLIC_DOMAIN` and `NGINX_SSL_DIR=./shared/ssl-public` in `.env` to avoid reverting to self-signed certs on later plain `docker compose up -d`
- Builds all images
- Starts all services

## 🔍 Verification Commands

After deployment, verify everything is running:

```bash
# Check all containers are up
docker compose ps
# All should show "Up" status

# Check logs
docker compose logs -f

# Check nginx
curl -k https://localhost
# Should return HTML

# Check from outside
curl -I https://transcendence42.xyz
# Should return: HTTP/2 200

# Check SSL certificate
echo | openssl s_client -connect transcendence42.xyz:443 2>/dev/null | openssl x509 -noout -issuer -dates
# Issuer should be "Let's Encrypt"

# Check www certificate SAN
echo | openssl s_client -connect www.transcendence42.xyz:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

## ⚠️ Common Issues

### Port 80 already in use

```bash
# Check what's using port 80
sudo lsof -i :80

# If Apache or nginx is running
sudo systemctl stop apache2
sudo systemctl disable apache2
# Or
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Docker permission denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in
exit
```

### Domain not resolving

```bash
# Wait for DNS propagation (can take 1-48 hours)
# Check from different locations: https://dnschecker.org

# Temporarily use /etc/hosts for testing
echo "13.59.195.11 transcendence42.xyz" | sudo tee -a /etc/hosts
```

### Let's Encrypt rate limit

If you hit Let's Encrypt rate limits (5 failures per hour):
- Wait 1 hour
- Use staging environment for testing:

```bash
# Test with staging (doesn't count against rate limits)
# Modify docker-compose.letsencrypt.yml to add --staging flag
```

## 📋 Current VM Configuration

- **Elastic IP**: 13.59.195.11
- **Domain**: transcendence42.xyz
- **OS**: Ubuntu (latest)
- **User**: ubuntu
- **SSH Key**: Required for access

## 🔄 Updates

To update the application:

```bash
cd transcendence
git pull
make aws
```

## 🔐 Security Notes

- Keep SSH key secure
- Use strong passwords for database/admin accounts
- Regularly update system: `sudo apt update && sudo apt upgrade`
- Monitor logs: `docker compose logs -f`
- Set up automatic certificate renewal (see AWS_DEPLOY.md)
