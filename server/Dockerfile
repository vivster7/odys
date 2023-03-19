# This is just used for development.
FROM node:16

COPY ./server /src/server

WORKDIR /src/server

RUN yarn install
CMD [ "yarn", "start-dev" ]
