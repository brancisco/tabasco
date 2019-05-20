#!/bin/bash

# usage: push.sh branch node_env

if [[ "$2" != "production" && "$2" != "staging" ]]; then
  exit 1
fi

log_dir=.logs
log_file=pull.log
location=$log_dir/$log_file

echo "$(date)" >> $location
stash_msg=$(git stash)
[ "$stash_msg" = "No local changes to save" ] && change=0 || change=1 
[ "$change" == "1" ] && echo $stash_msg >> $location
git checkout $1
git pull >> $location
[ "$change" == "1" ] && git stash clear >> $location
exit 0
