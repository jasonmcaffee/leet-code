#!/bin/bash

# Get the commit message from the first argument
COMMIT_MSG="$1"

# Execute the commands
git add .
git commit -am "$COMMIT_MSG"
git push -u origin main
npm run deploy
open https://leet-code-liard.vercel.app/ 