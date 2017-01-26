#!/bin/sh

apt-get update
apt-get install nodejs -y
apt-get install npm -y
npm install
nodejs server.js

