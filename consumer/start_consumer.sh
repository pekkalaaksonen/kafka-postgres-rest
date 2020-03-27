#!/bin/sh

echo "Intializig database."

node init.js

echo "Starting consumer."

node index.js
