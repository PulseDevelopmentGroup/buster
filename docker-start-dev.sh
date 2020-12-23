#!/bin/bash

docker run --name=buster-dev --env-file=.env --rm -d -v $(pwd)/data:/data buster