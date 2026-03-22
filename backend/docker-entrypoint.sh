#!/bin/sh
set -e

export PRISMA_URL="postgresql://<DB_User>:<DB_Password>@<DB_Host>:<DB_Port>/<DB_Name>"
echo "Using database: postgresql://<DB_User>:**********@<DB_Host>:<DB_Port>/<DB_Name>"

exec "$@"
