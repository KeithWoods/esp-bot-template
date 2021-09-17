#!/usr/bin/env bash
set -e # exit on error

# yarn add -W esp-js@5.1.2 esp-js-di@5.1.2 esp-js-rx@5.1.2

ESP_PATH=~/dev/esp-js
ESP_VERSION=$(node -p -e "require('$ESP_PATH/lerna.json').version")
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
NODE_MODULES=$SCRIPT_DIR/../node_modules

if [ ! -d "$NODE_MODULES" ]; then
  echo "Can't find node modules "
  exit 1;
fi

echo "Building ESP $ESP_VERSION"

echo "Building package";
yarn --cwd ${ESP_PATH} build-dev

echo "Pcking package";
yarn --cwd ${ESP_PATH} build-pack

function copyPackage() {
    echo "Copying package $1";
	  PACKAGE_NAME=$1
	  rm -rf ${NODE_MODULES}/${PACKAGE_NAME} && \
	  mkdir ${NODE_MODULES}/${PACKAGE_NAME} && \
	  tar -xzf ${ESP_PATH}/packages/${PACKAGE_NAME}/${PACKAGE_NAME}-v${ESP_VERSION}.tgz -C ${NODE_MODULES}/${PACKAGE_NAME} --strip 1
}

copyPackage esp-js
copyPackage esp-js-di
copyPackage esp-js-rx
