'use strict';

var path = require('path')
, basename = path.basename(path.dirname(__filename))
, debug = require('debug')('mill:contrib:' + basename)
, Transform = require("stream").Transform
, CSV = require('csv-string')
;

function Command(options)
{
  Transform.call(this, options);
  this.options = options || {}
  this.begin = true;
  this.separator = ',';
  this.buffer = '';
  this.title = options.title;
  this.titles = [];
  this.counter = 0;
}

Command.prototype = Object.create(
  Transform.prototype, { constructor: { value: Command }});

Command.prototype._transform = function (chunk, encoding, done) {
  var self = this, ret = '';

  self.buffer += chunk;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(self.buffer);
    self.emit('begin');
    ret = '[';
  }

  var r, s = 0;

  while (r = CSV.read(self.buffer.slice(s), this.separator, function (row) {
        var out = {};
        if (row[0] === '' && row.length === 1) {
          return;
        }
        self.counter++;

        if (self.title) {
          if (self.counter === 1) {
            self.titles = row.slice(0);
            return;
          }
          //if (row.length > self.titles.length) {
          // TODO
          //}
          for (var i = 0; i < row.length; i++) {
            out[self.titles[i]] = row[i];
          }
          ret += (ret !== '' && ret !== '[' ? ',' :'');
          ret +=  JSON.stringify(out);
        }
        else {
          ret += (ret !== '' && ret !== '[' ? ',' :'');
          ret +=  JSON.stringify(row);
        }
      }
    )
  ) {
    s += r;
  }
  self.push(ret);
  self.buffer = self.buffer.slice(s);
}
Command.prototype.end = function () {
  var self = this;
  self.push(']');
  self.emit('end');
};

module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}

