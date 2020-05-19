# Caddy is used as a reverse proxy (to drop malicious requests)
FROM caddy:2.0.0 as caddy

# Postgrest is the REST API server
FROM postgrest/postgrest:v7.0.0
COPY --from=caddy /usr/bin/caddy /usr/bin/caddy

# TODO: Deploy secrets
COPY ./start.sh start.sh
COPY ./caddy.json caddy.json

# Only allowed to write tmp in Google Cloud Run.
ENV HOME=/tmp/
# PGRST_ environment variables are set in console.cloud.google.com

# Start postgrest as background daemon
CMD ["./start.sh"]
EXPOSE 8080
