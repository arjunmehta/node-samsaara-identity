var samsaara;
var identities;


function initialize(samsaaraCore, globalIdentities) {
    samsaara = samsaaraCore;
    identities = globalIdentities;
    return Identity;
}


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

Identity.prototype.identifyConnection = function(connectionID) {

    var connection = samsaara.connection(connectionID);

    if (!this.validateConnection(connectionID)) {

        if (connection !== undefined) {
            connection.identities[this.type] = this;
        }

        this.connectionList[connectionID] = true;
        this.connectionCount++;
    }
};

Identity.prototype.unidentifyConnection = function(connectionID, autoRemove) {

    var connection = samsaara.connection(connectionID);

    if (this.validateConnection(connectionID)) {

        if (connection !== undefined) {
            connection.identities[this.type] = undefined;
        }

        delete this.connectionList[connectionID];
        this.connectionCount--;
    }

    if (autoRemove === true && this.connectionCount <= 0) {
        identities[this.type][this.value] = undefined;
    }
};

Identity.prototype.validateConnection = function(connectionID) {
    if (this.connectionList[connectionID] === true) {
        return true;
    }

    return false;
};

Identity.prototype.identifyAs = function(type, value) {
    var identity;
    var i;

    if (identities[type] === undefined) {
        identities[type] = {};
    }

    if (identities[type][value] === undefined) {
        identity = new Identity(type, value);
        identities[type][value] = identity;
    }

    identity.subidentities[type + this.value] = this;
    this.identities[type] = identity;

    for (i = 0; i < this.connections.length; i++) {
        this.connections[i].identities[type] = identity;
    }
};

Identity.prototype.unidentify = function(type) {

    var identity = this.identities[type];

    if (identity !== undefined) {
        identity.subidentities[type + this.value] = undefined;
        this.identities[type] = undefined;
    }
};

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
