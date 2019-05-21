#!/bin/bash

# usage: push.sh branch node_env

if [[ "$2" != "production" && "$2" != "staging" ]]; then
  exit 1
fi

log_dir=.logs
log_file=pull.log
location=$log_dir/$log_file

echo "$(date)" >> $location
git fetch --all >> $location
git reset --hard origin/$1 >> $location
git checkout $1 >> $location
exit 0
