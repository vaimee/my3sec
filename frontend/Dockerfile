FROM node:16-alpine as build
WORKDIR /app
COPY ./package*.json .

RUN --mount=type=secret,id=MY3SEC_IPFS_API_KEY \
    MY3SEC_IPFS_API_KEY=$(cat /run/secrets/MY3SEC_IPFS_API_KEY) \
    npm ci

COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html