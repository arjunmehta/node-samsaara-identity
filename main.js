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

        identity: function(type, value) {
            if (identities[type] !== undefined && identities[type][value] !== undefined) {
                return identities[type][value];
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

        clearIdentity: function(type, value) {
            var connections;
            var i;

            if (identities[type] !== undefined && identities[type][value] !== undefined) {
                connections = identities[type][value].connnections;
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

        unidentify: function(type) {

            var connection = this;
            var identity = connection.identities[type];

            if (identity !== undefined) {
                identity.unidentifyConnection(connection.id);
                connection.identities[type] = undefined;
            }
        },

        validateIdentity: function(type, value) {
            if (this.identities[type] !== undefined && this.identities[type].value === value) {
                return true;
            }

            return false;
        }
    },

    connectionPreInitialization: function(connection, done) {
        connection.identities = {};
    }
};
