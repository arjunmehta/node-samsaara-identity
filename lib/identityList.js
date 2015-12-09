var identities = {};
var Identity = require('./identity').Constructor;


function IdentityList() {
    this.list = identities;
}

IdentityList.prototype.createIdentityType = function(type) {

    if (identities[type] === undefined) {
        identities[type] = {};
    }

    return identities[type];
};

IdentityList.prototype.identityType = function(type) {

    if (identities[type] !== undefined) {
        return identities[type];
    }

    return null;
};

IdentityList.prototype.removeIdentityType = function(type) {

    var identityName;

    if (identities[type]) {
        for (identityName in identities[type]) {
            identities[type][identityName].clearAll();
        }
    }

    identities[type] = undefined;

    return true;
};

IdentityList.prototype.identity = function(type, value) {

    if (identities[type] !== undefined && identities[type][value] !== undefined) {
        return identities[type][value];
    }

    return null;
};

IdentityList.prototype.removeIdentity = function(type, value) {

    if (identities[type] !== undefined && identities[type][value] !== undefined) {
        identities[type][value].clearAll();
    }

    identities[type][value] = undefined;
};

IdentityList.prototype.removeIdentityFromList = function(type, value) {
    identities[type][value] = undefined;
};

IdentityList.prototype.getOrCreateIdentity = function(type, value) {

    var identity;

    if (identities[type] === undefined) {
        identities[type] = {};
    }

    if (identities[type][value] === undefined) {
        identity = new Identity(type, value);
        identities[type][value] = identity;
    } else {
        identity = identities[type][value];
    }

    return identity;
};


module.exports = new IdentityList();
