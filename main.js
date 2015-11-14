/*!
 * Samsaara Identity Middleware
 * Copyright(c) 2015 Arjun Mehta <arjun@arjunmehta.net>
 * MIT Licensed
 */

var debug = require('debugit').add('samsaara:identity');

var identities = {};
var Identity;


// function clearIdentity(type, id) {

//     if (identities[type] !== undefined && identities[type][id] !== undefined) {
//         identities[type][id] = undefined;
//     }
// }


module.exports = {

    name: 'identity',

    initialize: function(extender, capability, options) {

        Identity = require('./lib/identity').initialize(extender.core, identities);

        extender.addConnectionMethods(this.connectionMethods);
        extender.addCoreObjects(this.coreObjects);
        extender.addConnectionPreInitialization(this.connectionPreInitialization);

        return this;
    },

    coreObjects: {

        createIdentityType: function(type) {
            if (identities[type] === undefined) {
                identities[type] = {};
            }

            return identities[type];
        },

        identityType: function(type) {
            if (identities[type] !== undefined) {
                return identities[type];
            }

            return null;
        },

        removeIdentityType: function(type) {
            var identityName;

            if (identities[type]) {
                for (identityName in identities[type]) {
                    identities[type][identityName].clearAll();
                }
            }

            return true;
        },

        identity: function(type, value) {
            if (identities[type] !== undefined && identities[type][value] !== undefined) {
                return identities[type][value];
            }

            return null;
        },

        removeIdentity: function(type, value) {
            if (identities[type] !== undefined && identities[type][value] !== undefined) {
                identities[type][value].clearAll();
            }
        }
    },

    connectionMethods: {

        identifyAs: function(type, value) {

            var connection = this;
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

            identity.identifyConnection(connection.id);
            connection.identities[type] = identity;
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

            var connection = this;
            var identity = connection.identities[type];

            if (identity !== undefined) {
                identity.unidentifyConnection(connection.id, autoRemove);
                connection.identities[type] = undefined;
            }
        },

        unidentifyAll: function() {}
    },

    connectionPreInitialization: function(connection, done) {
        connection.identities = {};
    }
};
