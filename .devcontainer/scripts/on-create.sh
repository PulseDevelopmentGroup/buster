#! /bin/bash

set -ue

sudo chown node:node -R /workspace
sudo chown node:node -R /workspace/node_modules

git config --global --add safe.directory $(pwd)
