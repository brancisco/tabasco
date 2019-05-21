#!/bin/bash

# usage: push.sh branch node_env

if [[ "$2" != "production" || "$2" == "staging ]]; then
  exit 1
fi

[ "$1" == "staging" ] && main_dir=/home/pi/staging || main_dir=/home/pi/www
log_dir=.logs
log_file=pull.log
location=$main_dir/$log_dir/$log_file

echo "$(date), $location, *$1*" >> $location
git pull >> $location
exit 0
