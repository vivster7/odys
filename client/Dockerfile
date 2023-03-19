# This is just used for development.
FROM node:16

COPY ./client /src/client

WORKDIR /src/client

RUN yarn install
CMD [ "yarn", "start" ]
