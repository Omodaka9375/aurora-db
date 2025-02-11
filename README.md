<img src="favicon.ico" alt="logo" width="10%">

# AuroraDB

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
[![npm version](https://img.shields.io/npm/v/aurora-db)](https://www.npmjs.com/package/aurora-db)
[![License: MIT](https://img.shields.io/badge/MIT-blue.svg)](https://opensource.org/license/MIT)


Proxified asynchronous API for more flexible and distributed IndexedDB

Create a regular or distributed database in the browser for p2p applications, multiplayer games, collaborative software etc.

## Features

😇 Elegant Async/Await API:
 ```javascript
 await db.add(key, data)  // Add record
 await db.get(key)        // Get record
 await db.remove(key)     // Remove record
 await db.all()           // Get everything
 await db.destroy()       // Destroy everything
 ...
```
🤖 Modernized via Proxy so we can also have:
 ```javascript
  await db.filter()
  await db.every()
  await db.transaction()  
 ```
🚀 Distributed with a flip of a bool:
 ```javascript
  distributed: true // in db scheme
 ```
- Encryption, chunking and connection handled by PeerJS
- Minimal footprint
- Written in pure JavaScript, requiring no external libraries or frameworks

## Installation

Install AuroraDB from NPM:

```javascript
npm install aurora-db
```

Or use it from a CDN:
```javascript
<script src="https://cdn.jsdelivr.net/npm/aurora-db"></script>
```

## Usage/Examples

Create an scheme for your DB:
```javascript
const exampleScheme = {
    name: '#YourUniqueAppId',         // make your app name unique this wil be your unique channel name
    server: { host: '<server-url>' }, // peerjs-server config
    distributed: false,               // local or distributed deafult false
    keyPath: 'id',
    autoIncrement: false,
    indexes: [
        {name: "id", unique: true}, {name: "name"}
    ]
}
```

Instantiate AuroraDB and pass the scheme to the constructor:

```javascript
const db = new AuroraDB(exampleScheme)
```

Add to DB:
```javascript
await db.add("Player1", 9)  // Adding a score for highscore leaderboard example
```
Delete from DB:
```javascript
await db.remove("Player1") 
```
Get from DB:
```javascript
await db.get("Player1") 
```
Filter DB and return new Array:
```javascript
await db.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
```
Verify that all DB entries satisfy the condition:
```javascript
await db.every(e => e.name[0] == 'M') // Check if all users have a name starting with "M"
```
Slice DB for lazy loading and pagination:
```javascript
await db.slice(0,10) // Get the first 10 entries
```
Get all records from DB
```javascript
await db.all()
```
Control transactions if necessary
```javascript
await db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
```

Add some data to our DB:
```javascript
await db.add("Player1",  9) // eg. adding a score for leaderboard
```

Send our data to everyone:
```javascript
await db.post()
```
Get data from everyone:
```javascript
await db.fetch()
```

Subscribe to events:
```javascript
db.addEventListener("connection") // new peer joined
db.addEventListener("close")      // peer closed connection
db.addEventListener("change")     // local DB updated - can call post() after this
db.addEventListener("post")       // listen for DB requests
db.addEventListener("disconnect") // listen for DB requests
```
Get data from everyone:
```javascript
await db.fetch()
```

## Run PeerJS Server

Clone the project

```bash
git clone https://github.com/peers/peerjs-server.git
```

Go to the project directory

```bash
cd peerjs-server
```

Install dependencies

```javascript
npm install peer -g
```

Start the server

```javascript
peerjs --port 9000 --key peerjs

//Started PeerServer on ::, port: 9000, path: /  
```

Also, you can use Docker image to run a new container:
```javascript
docker run -p 9000:9000 -d peerjs/peerjs-server
```
For further server customization, please look at:

https://github.com/peers/peerjs-server

## API documentation

[AuroraDB API documentation](docs/aurora-db-api.md)

## Author

- [Branislav Đalić](https://github.com/Omodaka9375)

## License

[MIT](https://choosealicense.com/licenses/mit/)