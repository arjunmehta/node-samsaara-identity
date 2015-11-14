var debugit = require('debugit').enable();
var debug = debugit.add('samsaara:test:identity');

var test = require('tape').test;
var TapeFence = require('./tapefence');

var fences = {};

var WebSocketServer = require('ws').Server;
var samsaara = require('samsaara');
var identity = require('../main');

var connectionCount = 0;

var wss = new WebSocketServer({
    port: 8080
});

var theConnection;


// test setup

samsaara.on('initialized', function(connection) {
    debug('Connection Initialized', connection.name);
    fences['Connection Initialized'].hit(connection);
});

wss.on('connection', function(ws) {
    theConnection = samsaara.newConnection(ws, 'connection' + connectionCount++);
});

samsaara.expose({
    doneTest: function(cb) {
        cb(true);
        fences['Done Test'].hit(this);
    }
});


// tests

test('Samsaara Server Exists', function(t) {
    t.equal(typeof samsaara, 'object');
    t.end();
});

test('Samsaara can load TimeOffset middleware', function(t) {
    samsaara.use(identity, {
        identityTypes: ['userID']
    });
    t.end();
});

test('Samsaara can initialize', function(t) {
    var initialized = samsaara.initialize();
    t.equal(initialized, samsaara);
    t.end();
});


test('Global identity methods exist', function(t) {

    t.equal(typeof samsaara.identity, 'function');
    t.equal(typeof samsaara.identityType, 'function');
    t.equal(typeof samsaara.removeIdentityType, 'function');
    t.equal(typeof samsaara.createIdentityType, 'function');
    t.equal(typeof samsaara.removeIdentity, 'function');

    t.end();
});

test('Create Identity Type', function(t) {

    var identityType;
    identityType = samsaara.createIdentityType('sessionID');

    t.equal(typeof identityType, 'object');
    t.equal(typeof samsaara.identityType('sessionID'), 'object');
    t.equal(samsaara.identityType('sessionID'), identityType);

    t.end();
});

test('Connection methods exist', function(t) {

    fences['Connection Initialized'] = new TapeFence(1, function() {
        t.equal(samsaara.connection('connection0'), theConnection);
        t.equal(typeof theConnection, 'object');
        t.equal(typeof theConnection.identity, 'function');
        t.equal(typeof theConnection.identifyAs, 'function');
        t.equal(typeof theConnection.unidentify, 'function');
        t.equal(typeof theConnection.validateIdentity, 'function');
        t.end();
    });
});

test('Connection maps to Identity', function(t) {

    theConnection.identifyAs('sessionID', '123456789');
    t.equal(theConnection.identity('sessionID').value, '123456789');
    t.equal(samsaara.identity('sessionID', '123456789'), theConnection.identity('sessionID'));
    t.equal(theConnection.validateIdentity('sessionID', '123456789'), true);

    t.end();
});

test('Unidentify Connection', function(t) {

    theConnection.unidentify('sessionID', true);

    t.equal(theConnection.identity('sessionID'), undefined);
    t.equal(samsaara.identity('sessionID', '123456789'), null);
    t.equal(theConnection.validateIdentity('sessionID', '123456789'), false);

    t.end();
});

test('Hold Test', function(t) {
    setTimeout(function() {
        samsaara.connection('connection0').execute('continueTest')();
    }, 500);
    t.end();
});

test('Close Test', function(t) {
    fences['Done Test'] = new TapeFence(1, function() {
        wss.close();
        t.end();
    });
});
