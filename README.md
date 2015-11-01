# samsaara identity

[![Build Status](https://travis-ci.org/arjunmehta/node-samsaara-identity.svg?branch=1.0.0)](https://travis-ci.org/arjunmehta/node-samsaara-identity)

Identity middleware for [samsaara](https://www.github.com/arjunmehta/node-samsaara). Use this module to:

- **Attach an identity to and check the identity of samsaara connections. (This is usually done together with some kind of authentication.)**
- **Have multiple connections represent the same identity (eg. a user or session).**
- **Specifiy sub identities of a connection (eg. a specific http sessionID attached to a userID)**

**Note:** *Use of this module requires familiarity with [samsaara](https://www.github.com/arjunmehta/node-samsaara) (of course). It's amazing and you'll love it. Get familiarized.*
**Note:** *If you'd like to tie samsaara connections to an HTTP session, use **samsaara-http-session** in conjunction with **samsaara-identity**.*
**Note:** *If you'd like to authenticate samsaara messages for added security use **samsaara-authentication** in conjunction with **samsaara-identity**.*

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

## License
The MIT License (MIT)

Copyright (c) 2015 Arjun Mehta