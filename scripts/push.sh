#!/bin/bash

cd ..
echo "$(date)" >> ./scripts/.pull.log
git pull >> ./scripts/.pull.log
