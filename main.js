/* !
 * Samsaara Identity Middleware
 * Copyright(c) 2015 Arjun Mehta <arjun@arjunmehta.net>
 * MIT Licensed
 */

// var debug = require('debugit').add('samsaara:identity');

var identityList = require('./lib/identityList');
var Identity = require('./lib/identity');


module.exports = {

    name: 'identity',

    initialize: function(extender, capability, options) {

        Identity.initialize(extender.core);

        extender.addConnectionMethods(this.connectionMethods);
        extender.addCoreObjects(this.coreObjects);
        extender.addConnectionPreInitialization(this.connectionPreInitialization);

        return this;
    },

    coreObjects: {
        createIdentityType: identityList.createIdentityType,
        identityType: identityList.identityType,
        removeIdentityType: identityList.removeIdentityType,
        identity: identityList.identity,
        removeIdentity: identityList.removeIdentity
    },

    connectionMethods: {

        identifyAs: function(type, value) {

            var identity = identityList.getOrCreateIdentity(type, value);

            identity.identifyConnection(this);
            this.identities[type] = identity;
        },

        identity: function(type) {
            return this.identities[type];
        },

        validateIdentity: function(type, value) {
            if (this.identities[type] !== undefined && this.identities[type].value === value) {
                return true;
            }

            return false;
        },

        unidentify: function(type, autoRemove) {

            var identity = this.identities[type];

            if (identity !== undefined) {
                identity.unidentifyConnection(this, autoRemove);
                this.identities[type] = undefined;
            }
        },

        unidentifyAll: function() {}
    },

    connectionPreInitialization: function(connection) {
        connection.identities = {};
    }
};
