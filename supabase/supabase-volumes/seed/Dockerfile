# Seed runner image: node (for fetch + fs + URL encoding) + postgresql-client
# (for psql). Built once locally by docker compose (see the `build:` key on the
# seed service in docker-compose.yml). Cross-platform: runs inside Linux on
# both Windows and Unix hosts, so the whole stack starts with `docker compose up`.
FROM node:20-alpine

# postgresql-client provides psql, used by seed-runner.mjs to apply 06/07 SQL.
# No --no-cache: keep layer cacheable; this is a one-shot build.
RUN apk add --no-cache postgresql-client

WORKDIR /seed
COPY seed-runner.mjs ./

# The SQL files (06, 07), the documents tree, and the sentinel volume are
# bind-mounted at runtime via docker-compose.yml — keeping this image stable
# across data updates (no rebuild needed when seed content changes).
CMD ["node", "seed-runner.mjs"]
