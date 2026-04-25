#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -f "$ROOT_DIR/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env.local"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is missing. Add it to .env.local first." >&2
  exit 1
fi

if [[ -x "/opt/homebrew/opt/libpq/bin/psql" ]]; then
  export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
elif ! command -v psql >/dev/null 2>&1; then
  cat >&2 <<'EOF'
psql is not installed yet.

Run:
  brew install libpq

Then either:
  echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc

or just use this helper again after install.
EOF
  exit 1
fi

exec psql "$DATABASE_URL" "$@"
