# Build command on Apple M1: docker buildx build --platform linux/amd64 --push -t vaimee/website .
FROM node:16-alpine as build
WORKDIR /landing-page
COPY ./package*.json ./

RUN npm ci

COPY . .
RUN npm run build:minify

FROM nginx:alpine
COPY --from=build /landing-page /usr/share/nginx/html