#!/bin/sh
source ~/.nvm/nvm.sh \
&& nvm use stable \
&& npm install \
&& npm run dev
