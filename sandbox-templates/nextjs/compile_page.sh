#!/bin/sh

set -eu

cd /home/user
exec npm run dev -- --hostname 0.0.0.0
