#!/usr/bin/env bash
set -e # exit on error

# This Script copies the app and node modules into a docker volume
# This wasn't always needed and a bind mount was used, however that started breaking on mac.
# If I restarted docker, it'd work once, else it didn't update.
# The below method copies the data to a volume.
# Having volumes is a better pattern, it's just a bit of a dance to get node_modules in there, details below.

echo "Stopping and deleting bot container"
docker-compose stop bot

if [ "$(docker ps -aq --filter "name=botty_bot" --quiet)" ]; then
  docker rm $(docker ps -aq --filter "name=botty_bot")
fi

if [ "$(docker volume ls --filter "name=botty_botappvolume" --quiet)" ]; then
  echo "Deleting botappvolume Volume "
  docker volume rm botty_botappvolume --force
fi

echo "Creating App Volume"
docker volume create botty_botappvolume

if [ ! "$(docker volume ls --filter "name=botty_botstatevolume" --quiet)" ]; then
  echo "Creating botstatevolume Volume"
  docker volume create botty_botstatevolume
fi

# https://stackoverflow.com/a/59912484/36146
# Tar Flags:
# -C <dir>  Change to <dir> before processing remaining files
# -c        create
# -f- .     Location of file, or if -, to standard out
# .         The working dir
# Docker Flags:
# --rm      Remove one or more containers
# -i        -i/--interactive - allows you to send commands to the container via standard input
# -v        volume
# alpine    the image, this is an official 5mb docker image
# ...       The rest is the unpack command

# this tar via standard in/out works ok, but it didn't for node modules.
echo "Copying App"
tar -C ../dist -c -f- . | docker run --rm -i -v botty_botappvolume:/data alpine tar -C /data -x -f-
echo ""

# For copying node modules, it got hung up on the sym links, even with -h
# As a workaround, I'm zipping node modules, mounting it and another volume and copying it over
echo "Copying node_modules"
rm -rf env-temp
mkdir env-temp
tar -C ../node_modules -ch -f ./env-temp/node_modules.tar .
docker run \
      --rm \
      -i \
      -v botty_botappvolume:/data \
       --mount type=bind,source="$(pwd)"/env-temp,target=/env-temp \
       alpine \
       /bin/sh -c "cp /env-temp/node_modules.tar /data/ && mkdir /data/node_modules && tar -C /data/node_modules -x -f /data/node_modules.tar && rm /data/node_modules.tar"
rm -rf env-temp
echo ""

echo "Copying API Keys and listing botty_botappvolume volume contents "
docker run \
      --rm \
      -i \
      -v botty_botappvolume:/data \
       --mount type=bind,source="$(pwd)"/../.config/,target=/env-temp \
       alpine \
       /bin/sh -c "cp /env-temp/prod.config.json /data/ && ls -la /data"

echo ""
echo "Done: botappvolume volume contents above"

echo "Restarting bot"
docker-compose up -d bot