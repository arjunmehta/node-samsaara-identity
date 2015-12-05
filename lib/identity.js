var identityList;
var samsaara;


function initialize(samsaaraCore) {
    samsaara = samsaaraCore;
    identityList = require('./identityList');

    return Identity;
}


// Main Constructor

function Identity(type, value) {
    this.type = type;
    this.value = value;
    this.connectionCount = 0;
    this.connectionList = {};
    this.subidentities = {};
    this.identities = {};
}

Object.defineProperties(Identity.prototype, {

    connections: {
        get: function() {
            return buildConnectionArray(this);
        }
    },

    connectionMembers: {
        get: function() {
            return buildConnectionMembers(this);
        }
    },

    count: {
        get: function() {
            var members = buildConnectionMembers(this);
            return Object.keys(members).length;
        }
    }
});


// Clearing Methods

Identity.prototype.clearConnections = function() {

    var connectionID;
    var connection;

    for (connectionID in this.connectionList) {
        connection = samsaara.connection(connectionID);
        if (connection !== undefined) {
            connection.identities[this.type] = undefined;
        }
    }

    this.connectionList = {};
    this.connectionCount = 0;
};

Identity.prototype.clearSubidentities = function() {

    var subidentity;

    for (subidentity in this.subidentities) {
        this.subidentities[subidentity].unidentify(this.type);
    }
};

Identity.prototype.clearAll = function() {
    this.clearConnections();
    this.clearSubidentities();
};


// Connection Identification Methods

Identity.prototype.identifyConnection = function(connection) {

    if (!this.validateConnection(connection.id)) {
        connection.identities[this.type] = this;
        this.connectionList[connection.id] = true;
        this.connectionCount++;
    }
};

Identity.prototype.unidentifyConnection = function(connection, autoRemove) {

    var identity;
    var identityName;
    var connectionID = connection.id;

    if (this.validateConnection(connectionID) === true) {

        connection.identities[this.type] = undefined;

        for (identityName in this.identities) {

            identity = this.identities[identityName];

            if (identity.connectionList[connectionID] !== true) {
                connection.identities[identity.type] = undefined;
            }
        }

        delete this.connectionList[connectionID];
        this.connectionCount--;
    }

    if (autoRemove === true && this.connectionCount <= 0) {
        console.log(identityList.getOrCreateIdentity);
        identityList.removeIdentityFromList(this.type, this.value);
    }
};

Identity.prototype.validateConnection = function(connectionID) {
    if (this.connectionList[connectionID] === true) {
        return true;
    }

    return false;
};


// Subidentity Methods

Identity.prototype.identifyAs = function(type, value) {

    var identity;
    var connections = this.connections;
    var i;

    if (this.identities[type] !== undefined) {
        this.unidentify(type);
    }

    identity = identityList.getOrCreateIdentity(type, value);
    identity.subidentities[type + this.value] = this;
    this.identities[type] = identity;

    for (i = 0; i < connections.length; i++) {
        if (identity.validateConnection(connections[i].id) === false) {
            connections[i].identities[type] = identity;
        }
    }
};

Identity.prototype.unidentify = function(type) {

    var identity = this.identities[type];
    var connections = this.connections;
    var i;

    if (identity !== undefined) {
        identity.subidentities[type + this.value] = undefined;
        this.identities[type] = undefined;

        for (i = 0; i < connections.length; i++) {
            if (identity.validateConnection(connections[i].id) === false) {
                connections[i].identities[type] = undefined;
            }
        }
    }
};


// Execution Methods

Identity.prototype.nameSpace = function(namespaceName) {

    var identity = this;

    return {
        execute: function(funcName) {

            return function() {
                var i;
                var connections = identity.connections;

                for (i = 0; i < connections.length; i++) {
                    connections[i].execute(funcName, namespaceName).apply(identity, arguments);
                }
            };
        }
    };
};

Identity.prototype.execute = function(funcName, namespaceName) {

    var identity = this;

    return function() {
        var i;
        var connections = identity.connections;

        for (i = 0; i < connections.length; i++) {
            connections[i].execute(funcName, namespaceName).apply(identity, arguments);
        }
    };
};


// Helper Methods

function buildConnectionMembers(identity) {

    var connectionMembers = identity.connectionList;
    var subidentities = identity.subidentities;
    var mergedMembers = {};

    var identityName;
    var connectionID;

    for (connectionID in connectionMembers) {
        mergedMembers[connectionID] = true;
    }

    for (identityName in subidentities) {
        connectionMembers = subidentities[identityName].connectionMembers;
        for (connectionID in connectionMembers) {
            mergedMembers[connectionID] = true;
        }
    }

    return mergedMembers;
}

function buildConnectionArray(identity) {

    var connectionMembers = identity.connectionMembers;
    var connectionArray = [];
    var connectionID;
    var connection;

    for (connectionID in connectionMembers) {
        connection = samsaara.connection(connectionID);
        if (connection !== undefined) {
            connectionArray.push(connection);
        }
    }

    return connectionArray;
}


module.exports = {
    initialize: initialize,
    Constructor: Identity
};
