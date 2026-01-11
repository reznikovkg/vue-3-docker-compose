FROM node:22

RUN npm install -g @vue/cli@~5.0.9

WORKDIR /vue

COPY package.json ./

RUN npm install

RUN npm install -D less

COPY ./ ./

EXPOSE 5173

ENTRYPOINT npm run devhost
