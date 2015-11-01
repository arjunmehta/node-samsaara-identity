# samsaara identity

[![Build Status](https://travis-ci.org/arjunmehta/node-samsaara-identity.svg?branch=1.0.0)](https://travis-ci.org/arjunmehta/node-samsaara-identity)

The identity middleware for [samsaara](https://www.github.com/arjunmehta/node-samsaara) is a powerful way of organizing connections. Use this module to:

- **Attach an identity to and check the identity of samsaara connections. (This is usually done together with some kind of authentication.)**
- **Have multiple connections represent the same identity (eg. a user or session).**
- **Specifiy sub identities of a connection (eg. a specific http sessionID attached to a userID)**

**Note:** _Use of this module requires familiarity with [samsaara](https://www.github.com/arjunmehta/node-samsaara) (of course). It's amazing and you'll love it. Get familiarized._<br/>
**Note:** _If you'd like to tie samsaara connections to an HTTP session, use **samsaara-http-session** in conjunction with **samsaara-identity**._<br/>
**Note:** _If you'd like to authenticate samsaara messages for added security use **samsaara-authentication** in conjunction with **samsaara-identity**._

## Installation

```bash
npm install --save samsaara-identity
```

## Basic Usage

### Server Side

Just add the `identity` middleware to your samsaara instance.

```javascript
var samsaara = require('samsaara')
var identity = require('samsaara-identity')

samsaara
  .use(identity, ['username'])
  .initialize()
```

Now you can identify connections:
```javascript
samsaara.expose({

  login: function(userID, password){

    var connection = this

    checkPassword(userID, password, function(err, success){
      if(!err && success) connection.identifyAs('username', userID)
    })
  },

  logout: function(userID){
    var connection = this
    if(connection.validateIdentity('username', userID)){
        connection.unidentify('username')
    }
  },
})
```

#### Retreiving Identity
You can get the identity of any connection, by simply calling the `identity()` method on the connection.

```javascript
var userID = connection.identity('username')
```


#### Multiple Identities
A connection can only have one identity of any particular `identityType`.
Subidentities are identity subspaces.You can get the identity of any connection, but simply calling the `getIdentity()` method on the connection.

```javascript
connection.identifyAs('username', userID)
connection.identifyAs('session', sessionID)

connection.validateIdentity('session', userID) // true
connection.identity('session') // sessionID

samsaara.identity('session', sessionID).identifyAs('username', userID)
samsaara.identity('session', sessionID).execute('methodName')()
samsaara.identity('session', sessionID).nameSpace('something').execute('methodName')()
samsaara.identity('session', sessionID).connections
samsaara.identity('session', sessionID).count
```

#### Sub identities
An identity can identify as another identity. This is useful if you want to automatically assign an identity as being of another identity.

For example, if all sessions with `sessionID` belong to a username of `userID`:

```javascript
samsaara.identity('session', sessionID).identifyAs('username', userID)
```

Now anything that identifies with sessionID will also identify with userID.

```javascript
samsaara.identity('username', userID).connections // will include all connections from sessionID too.
```

## API

### Samsaara
#### samsaara.identity(identityType, identityValue)
Returns the `Identity` object with `identityValue` of `identityType`.

#### samsaara.removeIdentityType(identityType)
Removes all identities of `identityType` from samsaara.

#### samsaara.addIdentityType(identityType)
Adds an identity with `identityValue` of `identityType` to samsaara.

#### samsaara.removeIdentity(identityType, identityValue)
Removes the identity with `identityValue` of `identityType` from samsaara.

### Connection
#### connection.identifyAs(identityType, identityValue)
Identifies the connection with `identityValue` for `identityType`.

#### connection.unidentify(identityType)
Clears the `identityType` identity from the connection.


#### connection.identity(identityType)
Returns the `identityValue` of the connection's `identityType` identity.

#### connection.validateIdentity(identityType, identityValue)
Returns a Boolean validating whether the connection is identified as (`identityType`, `identityValue`).

### Identity
#### identity.identifyAs(identityType, identityValue)
Identifies the identity as a sub-identity of another identity.

#### identity.unidentify(identityType)
Makes the identity no longer a sub-identity of the `identityType`.

#### identity.execute(methodName)(args, cb)
Executes an exposed method on all connections attached to the identity.

#### identity.nameSpace(nameSpaceName)
Returns a samsaara nameSpace object for the identity. Executing methods within this namespace will execute the exposed method on all connections attached to the identity.

#### identity.connections
An Array of all the connections attached to the identity.

#### identity.count
The Number of connections attached to the identity.

## License
The MIT License (MIT)

Copyright (c) 2015 Arjun Mehta