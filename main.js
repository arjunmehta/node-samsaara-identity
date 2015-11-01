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

        return this;
    },

    coreMethods: {

        identity: function(type, id) {
            if (identities[type] !== undefined && identities[type][id] !== undefined) {
                return identities[type][id];
            }

            return null;
        },

        removeIdentityType: function(type) {
            if (identities[type]) {
                identities[type].remove();
            }

            return true;
        },

        createIdentityType: function(type) {
            if (identities[type] === undefined) {
                identities[type] = {};
            }

            return identities[type];
        },

        clearIdentity: function(type, id) {
            var connections;
            var i;

            if (identities[type] !== undefined && identities[type][id] !== undefined) {
                connections = identities[type][id].connnections;
                for (i = 0; i < connections.length; i++) {
                    connections[i].unidentify(type);
                }
            }
        }
    },

    connectionMethods: {

        identity: function(type) {
            return this.identities[type];
        },

        identifyAs: function(type, id) {

            var connection = this;
            var identity;

            if (identities[type] === undefined) {
                identities[type] = {};
            }

            if (identities[type][id] === undefined) {
                identity = new Identity(type, id);
                identities[type][id] = identity;
            } else {
                identity = identities[type][id];
            }

            identity.identifyConnection(connection.id);
            connection.identities[type] = identity;
        },

        unidentify: function(type) {

            var connection = this;
            var identity = connection.identities[type];

            if (identity !== undefined) {
                identity.unidentifyConnection(connection.id);
                connection.identities[type] = undefined;
            }
        },

        validateIdentity: function(type, id) {
            if (this.identities[type] !== undefined && this.identities[type].id === id) {
                return true;
            }

            return false;
        }
    },

    connectionPreInitialization: function(connection, done) {
        connection.identities = {};
    }
};
