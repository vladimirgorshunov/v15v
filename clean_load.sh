#!/bin/sh
git fetch \
&& git pull \
&& source ~/.nvm/nvm.sh \
&& nvm use stable \
&& npm install \
&& npm run dev
