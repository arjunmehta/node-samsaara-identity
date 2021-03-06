// var debugit = require('debugit').enable();
// var debug = debugit.add('samsaara:test:identity');

var WebSocket = require('ws');
var samsaara = require('samsaara');

var test = require('tape').test;
var TapeFence = require('./tapefence');
var fences = {};

var ws;

require('es5-shim');


// test setup

samsaara.expose({
    continueTest: function() {
        console.log('CONTINUING TEST');
        fences['Wait to Continue'].hit('continue');
    }
});


// tests

test('Samsaara Client Exists', function(t) {
    t.equal(typeof samsaara, 'object');
    t.end();
});

test('Samsaara initializes', function(t) {

    t.plan(1);

    ws = new WebSocket('ws://localhost:8081');

    samsaara.initialize({
        socket: ws
    });

    t.equal(typeof samsaara.core, 'object');
    t.end();
});

test('Wait to Continue', function(t) {

    fences['Wait to Continue'] = new TapeFence(1, function(c) {
        if (c === 'continue') {
            t.end();
        }
    });
});

test('End Test', function(t) {
    samsaara.core.execute('doneTest')(function() {
        t.end();
        ws.close();
    });
});
