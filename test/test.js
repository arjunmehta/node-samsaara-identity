var debugit = require('debugit').enable();
var debug = debugit.add('samsaara:test:identity');

var test = require('tape').test;
var TapeFence = require('./tapefence');

var WebSocketServer = require('ws').Server;
var samsaara = require('samsaara');
var identity = require('../main');

var identityList = require('../lib/identityList');

var theConnection;
var fences = {};
var connectionCount = 0;

var wss = new WebSocketServer({
    port: 8081
});


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

    var identityType = samsaara.createIdentityType('sessionID');

    t.equal(typeof identityType, 'object');
    t.equal(typeof samsaara.identityType('sessionID'), 'object');
    t.equal(samsaara.identityType('sessionID'), identityType);
    t.equal(typeof identityList.list.sessionID, 'object');

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

    t.equal(identityList.list.sessionID['123456789'].value, '123456789');
    t.equal(identityList.list.sessionID['123456789'], theConnection.identity('sessionID'));

    t.end();
});

test('Unidentify Connection', function(t) {

    theConnection.unidentify('sessionID');

    t.equal(theConnection.identity('sessionID'), undefined);
    t.equal(theConnection.validateIdentity('sessionID', '123456789'), false);
    t.equal(theConnection.identities['sessionID'], undefined);
    t.equal(typeof samsaara.identity('sessionID', '123456789'), 'object');


    theConnection.identifyAs('sessionID', '123456789');
    theConnection.unidentify('sessionID', true);

    t.equal(identityList.list['sessionID']['123456789'], undefined);
    t.equal(samsaara.identity('sessionID', '123456789'), null);

    t.end();
});

test('Add Subidentity', function(t) {

    samsaara.createIdentityType('userID');
    theConnection.identifyAs('sessionID', '123456789');
    samsaara.identity('sessionID', '123456789').identifyAs('userID', 'jambalaya');

    t.equal(theConnection.identity('userID').value, 'jambalaya');
    t.equal(samsaara.identity('userID', 'jambalaya'), theConnection.identity('userID'));
    t.equal(theConnection.validateIdentity('userID', 'jambalaya'), true);

    t.equal(identityList.list['userID']['jambalaya'], theConnection.identity('userID'));


    t.end();
});

test('Connection Lists', function(t) {
    t.equal(identityList.list['userID']['jambalaya'].connections[0], theConnection);
    t.equal(identityList.list['userID']['jambalaya'].connectionMembers[theConnection.id], true);
    t.equal(identityList.list['userID']['jambalaya'].count, 1);

    t.end();
});


test('Unidentify Subidentity', function(t) {

    samsaara.identity('sessionID', '123456789').unidentify('userID');

    t.equal(theConnection.identity('userID'), undefined);
    t.equal(samsaara.identity('userID', 'jambalaya').connections.length, 0);
    t.equal(theConnection.validateIdentity('userID', 'jambalaya'), false);

    t.equal(theConnection.identities['userID'], undefined);
    t.equal(theConnection.identities['sessionID'].value, '123456789');

    t.equal(identityList.list['userID']['jambalaya'].connections[0], undefined);
    t.equal(identityList.list['userID']['jambalaya'].connectionMembers[theConnection.id], undefined);
    t.equal(identityList.list['userID']['jambalaya'].count, 0);

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
