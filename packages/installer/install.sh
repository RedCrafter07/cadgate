#!/bin/bash

GREEN='\033[0;32m'
NOCOLOR='\033[0m'

echo -e "${GREEN}> Downloading the installer...${NOCOLOR}"

curl -L https://github.com/RedCrafter07/cadgate/releases/latest/download/installer -o cadgateInstaller
chmod +x cadgateInstaller

if [ "${X}" = "true" ]; then
	./cadgateInstaller

	if [ "${CLEANUP}" = "true" ]; then
		rm ./cadgateInstaller  
	fi
else
    echo -e "${GREEN}> File saved to ./cadgateInstaller.${NOCOLOR}"
	echo -e "${GREEN}> For details about the supported environment variables, check the documentation: https://github.com/RedCrafter07/cadgate?tab=readme-ov-file#installation${NOCOLOR}"
fi
