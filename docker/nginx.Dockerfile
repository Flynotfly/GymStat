# Stage 1: Build the React app using Node
FROM node:20.18 as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Stage 2: Build the final Nginx image
FROM nginx:1.25.5
COPY config/nginx /etc/nginx/templates
COPY --from=build /app/build /usr/share/nginx/html