# Use official Nginx Alpine
FROM nginx:stable-alpine

# Copy React Vite build output
COPY dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose container port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# Build Docker image
### docker build . -t royals-library ; docker run -d -p 8080:80 --name royals-library royals-library