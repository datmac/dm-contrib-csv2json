#!/usr/bin/env node

var manifest = require('./manifest.json'),
    command = require('./index.js'),
    options = require('mill-core').cli(manifest)
;
command(options, process.stdin).pipe(process.stdout);
