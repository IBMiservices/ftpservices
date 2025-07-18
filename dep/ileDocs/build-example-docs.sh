#!/bin/sh

ln -s -f  -T local-noxdb.json config/local.json
npm start

rm -f config/local.json