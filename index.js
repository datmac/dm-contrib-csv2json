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
  this.numrow = 0;
}

Command.prototype = Object.create(
  Transform.prototype, { constructor: { value: Command }});

Command.prototype.parse = function (rows) {
  var self = this, ret = '';

  rows.forEach(function (row) {
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
        ret += (self.numrow > 0 ? ',' : '');
        ret +=  JSON.stringify(out);
      }
      else {
        ret += (self.numrow > 0 ? ',' :'');
        ret +=  JSON.stringify(row);
      }
      self.numrow++;
    }
  );
  self.push(ret);
}
Command.prototype._transform = function (chunk, encoding, done) {
  var self = this;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(chunk.toString());
    self.emit('begin');
    self.push('[');
  }
  self.buffer = self.buffer.concat(chunk.toString());
  var x = CSV.readChunk(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  done();
  self.buffer = self.buffer.slice(x);
}
Command.prototype.end = function () {
  var self = this;

  CSV.readAll(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  self.push(']');
  self.emit('end');
};


module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}

