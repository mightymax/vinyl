#!/usr/bin/env bash
TARGET=/home/www/vinyl.lindeman.nu
rsync -Cavz --filter=':- .gitignore' . home.lindeman.nu:$TARGET
ssh home.lindeman.nu sudo docker-compose --project-directory $TARGET down
ssh home.lindeman.nu sudo docker-compose --project-directory $TARGET up --build -d
