#!/bin/bash
# =============================================================================
# Script tự động cấu hình môi trường chạy TomQ Bridal trên Ubuntu 24.04
# Chạy script này trên VPS (với quyền sudo hoặc root):
#   chmod +x vps-setup.sh && ./vps-setup.sh
# =============================================================================

set -e

echo "=== 1. TẠO SWAP 4GB (Tránh tràn RAM 2GB khi build Next.js) ==="
if [ ! -f /swapfile ]; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "✅ Đã tạo swap 4GB thành công!"
else
  echo "Swap file đã tồn tại, bỏ qua."
fi

echo "=== 2. CÀI ĐẶT NODE.JS 22 LTS, GIT, NGINX, PM2 ==="
sudo apt-get update -y
sudo apt-get install -y curl ca-certificates gnupg git nginx

# Cài NodeSource Node.js 22 LTS (Bắt buộc >= 22.5 để chạy node:sqlite)
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Phiên bản Node.js: $(node -v)"
echo "Phiên bản npm: $(npm -v)"

# Cài PM2 toàn cục
sudo npm install -g pm2

echo "=== 3. CHUẨN BỊ THƯ MỤC DỰ ÁN /var/www/tomqbridal ==="
sudo mkdir -p /var/www/tomqbridal
sudo chown -R $USER:$USER /var/www/tomqbridal

echo "=== 4. CẤU HÌNH NGINX REVERSE PROXY ==="
sudo tee /etc/nginx/sites-available/tomqbridal > /dev/null <<'EOF'
server {
    listen 80;
    server_name 116.118.9.145; # Thay bằng tên miền nếu có

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/tomqbridal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "============================================================================="
echo "✅ HOÀN TẤT THIẾT LẬP MÔI TRƯỜNG CƠ BẢN TRÊN VPS!"
echo "Bước tiếp theo:"
echo "1. Clone dự án vào /var/www/tomqbridal:"
echo "   git clone https://github.com/joephamduong/TomQ-Bridal-2.git /var/www/tomqbridal"
echo "   cd /var/www/tomqbridal && cp .env.example .env"
echo "   npm install && npm run seed && npm run build"
echo "   pm2 start ecosystem.config.cjs && pm2 save && pm2 startup"
echo "============================================================================="
