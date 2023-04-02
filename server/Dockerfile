FROM postgrest/postgrest:v9.0.1 as postgrest


# This is just used for development.
FROM node:16


COPY --from=postgrest /bin/postgrest /bin/postgrest

WORKDIR /src/server

CMD [ "yarn", "run", "start-dev" ]
