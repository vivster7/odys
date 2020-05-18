# Caddy is used as a reverse proxy (to drop malicious requests)
FROM caddy:2.0.0

# Postgrest is the REST API server
FROM postgrest/postgrest:v7.0.0
COPY --from=0 /usr/bin/caddy /usr/bin/caddy


# TODO: Deploy secrets
COPY ./postgrest.production.conf postgrest.production.conf
COPY ./start.sh start.sh
COPY ./caddy.json caddy.json

# Only allowed to write tmp in Google Cloud Run.
ENV HOME=/tmp/

# Start postgrest as background daemon
CMD ["./start.sh"]
EXPOSE 8080

