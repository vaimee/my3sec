FROM node:16-alpine as build
WORKDIR /app
COPY ./package*.json ./

RUN npm ci

COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/dist/frontend /usr/share/nginx/html