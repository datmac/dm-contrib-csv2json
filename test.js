'use strict';
var  path = require('path')
, basename = path.basename(path.dirname(__filename))
, util = require('util')
, should = require('should')
, tester = require('mill-core').tester
, command = require('./index.js')
;


describe(basename, function () {

    describe('#1', function () {
        it('should return json', function (done) {
            tester(command, {title: true})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\n')
            .end(function (err, res) {
                var out = JSON.parse(res);
                out.should.includeEql({'xxx' : 'A', 'yyy' : 'B', 'zzz' : 'C'})
                done();
              }
            );
          }
        )
      }
    )
    describe('#2', function () {
        it('should return json', function (done) {
            tester(command, {title: false})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\n')
            .end(function (err, res) {
                var out = JSON.parse(res);
                out.should.includeEql(['A','B', 'C'])
                done();
              }
            );
          }
        )
      }
    )

  }
);
