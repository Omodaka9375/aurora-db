# AuroraDB API

## Classes

<dl>
<dt><a href="#">IDB</a> ⇐ <code>EventTarget</code></dt>
<dd></dd>
<dt><a href="#IDBStore">IDBStore</a> ⇐ <code><a href="#IDB">IDB</a></code></dt>
<dd></dd>
<dt><a href="#IDBStore">IDBStore</a> ⇐ <code><a href="#IDB">IDB</a></code></dt>
<dd></dd>
</dl>

<a name="IDB"></a>

## IDB ⇐ <code>EventTarget</code>
**Kind**: global class  
**Extends**: <code>EventTarget</code>  

* [IDB](#IDB) ⇐ <code>EventTarget</code>
    * [new IDB(scheme)](#new_IDB_new)
    * [.entries](#IDB+entries) : <code>Proxy</code>
    * [.open()](#IDB+open) ⇒ <code>Promise</code>

<a name="new_IDB_new"></a>

### new IDB(scheme)
IDB class - async proxy wrapper for IndexedDB


| Param | Type | Description |
| --- | --- | --- |
| scheme | <code>Object</code> | SchemeObject |

<a name="IDB+entries"></a>

### IDB.entries : <code>Proxy</code>
Proxy API for manipulating DB.

**Kind**: instance property of [<code>IDB</code>](#IDB)  
**Emits**: <code>event:onchange</code>, <code>event:onset</code>, <code>event:ondelete</code>  
**Example**  
```js
db.entries[key] = {key: data} // Set entry
await db.entries[key] // Get entry
delete db.entries[key] // Remove entry
for await (let entry of db.entries) {} // Iterate entries
```
<a name="IDB+open"></a>

### IDB.open() ⇒ <code>Promise</code>
Open DB

**Kind**: instance method of [<code>IDB</code>](#IDB)  
**Emits**: <code>event:open</code>  

<a name="IDBStore"></a>

## IDBStore ⇐ [<code>IDB</code>](#IDB)
**Kind**: global class  
**Extends**: [<code>IDB</code>](#IDB)  

* [IDBStore](#IDBStore) ⇐ [<code>IDB</code>](#IDB)
    * [new IDBStore(scheme)](#new_IDBStore_new)
    * [.entries](#IDB+entries) : <code>Proxy</code>
    * [.filter(fn)](#IDBStore+filter)
    * [.every(fn)](#IDBStore+every)
    * [.slice(start, end)](#IDBStore+slice)
    * [.all()](#IDBStore+all)
    * [.concat(array)](#IDBStore+concat)
    * [.transaction(fn)](#IDBStore+transaction)
    * [.open()](#IDB+open) ⇒ <code>Promise</code>

<a name="new_IDBStore_new"></a>

### new IDBStore(scheme)

| Param | Type | Description |
| --- | --- | --- |
| scheme | <code>Object</code> | SchemeObject |

<a name="AuroraDB+entries"></a>

### IDBStore.entries : <code>Proxy</code>
Proxy API for manipulating DB.

**Kind**: instance property of [<code>IDBStore</code>](#IDBStore)  
**Emits**: <code>event:onchange</code>, <code>event:onset</code>, <code>event:ondelete</code>  
**Example**  
```js
db.entries[key] = {key: data} // Set entry
await db.entries[key] // Get entry
delete db.entries[key] // Remove entry
for await (let entry of db.entries) {} // Iterate entries
```
<a name="IDBStore+filter"></a>

### IDBStore.filter(fn)
Filter DB and return new Array of results.

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
await users.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
```
<a name="IDBStore+every"></a>

### IDBStore.every(fn)
Verify that all DB entries satisfy the condition 'fn'.

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
await users.every(e => e.name[0] == 'J') // Check if all users have a name starting with "J"
```
<a name="IDBStore+slice"></a>

### IDBStore.slice(start, end)
Slice DB.

Useful for pagination.

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  

| Param | Type |
| --- | --- |
| start | <code>Number</code> | 
| end | <code>Number</code> | 

**Example**  
```js
await users.slice(0,10) // Get the first 10 entries
```
<a name="IDBStore+all"></a>

### IDBStore.all()

Get all entries.

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  
**Example**  
```js
await users.all()
```
<a name="IDBStore+concat"></a>

### IDBStore.concat(array)
! Mutates DB !

Concat DB with the array.

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  

| Param | Type | Description |
| --- | --- | --- |
| array | <code>Array</code> | Array of entries |

**Example**  
```js
await users.concat([{name: "Sasuke"}])
```
<a name="IDBStore+transaction"></a>

### IDBStore.transaction(fn)
IDBStore transaction.

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  

| Param | Type |
| --- | --- |
| fn | <code>function</code> | 

**Example**  
```js
db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
```
<a name="AuroraDB+open"></a>

### IDBStore.open() ⇒ <code>Promise</code>
Open DB

**Kind**: instance method of [<code>IDBStore</code>](#IDBStore)  
**Emits**: <code>event:open</code>  


<a name="PeerStore"></a>

## PeerStore ⇐ [<code>IDBStore</code>](#IDBStore)
**Kind**: global class  
**Extends**: [<code>IDBStore</code>](#IDB)  

* [PeerStore](#PeerStore) ⇐ [<code>IDBStore</code>](#IDBStore)
    * [new PeerStore(scheme, id)](#new_PeerStore_new)
    * [p2padapter](#PeerStore+p2padapter) : <code>NetAdapterObject</code>


<a name="new_PeerStore_new"></a>

### new PeerStore(scheme, id)

| Param | Type | Description |
| --- | --- | --- |
| scheme | <code>Object</code> | SchemeObject |
| id | <code>String</code> | PeerId (optional) |

<a name="PeerStore+entries"></a>


## Functions

<dl>
<dt><a href="#p2padapter">p2padapter(peer, db)</a> ⇒ <code><a href="#NetAdapterObject">NetAdapterObject</a></code></dt>
<dd><p>PeerJS NetAdapter.
Responsible for connecting to peers and establishing communication channels between databases</p>
</dd>
</dl>

## Interfaces

<dl>
<dt><a href="#NetAdapterObject">NetAdapterObject</a></dt>
<dd></dd>
</dl>

<a name="NetAdapterObject"></a>

## NetAdapterObject
**Kind**: global interface  

* [NetAdapterObject](#NetAdapterObject)
    * [.connect()](#NetAdapterObject.connect)
    * [.broadcast(header, method, [data])](#NetAdapterObject.broadcast)
    * [.channel(header, methods)](#NetAdapterObject.channel)

<a name="NetAdapterObject.connect"></a>

### NetAdapterObject.connect()
Connect to other peers

**Kind**: static method of [<code>NetAdapterObject</code>](#NetAdapterObject)  
<a name="NetAdapterObject.broadcast"></a>

### NetAdapterObject.broadcast(header, method, [data])
Broadcast message to other peers

**Kind**: static method of [<code>NetAdapterObject</code>](#NetAdapterObject)  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>String</code> | Name of channel |
| method | <code>String</code> | Name of method (usually 'get' or 'post') |
| [data] | <code>Object</code> | Any object |

**Example**  
```js
db.broadcast('tags','get')
```
<a name="NetAdapterObject.channel"></a>

### NetAdapterObject.channel(header, methods)
Create channel

**Kind**: static method of [<code>NetAdapterObject</code>](#NetAdapterObject)  

| Param | Type | Description |
| --- | --- | --- |
| header | <code>String</code> | Name of channel |
| methods | <code>Object</code> | Methods of NetAdapter |

**Example**  
```js
db.net.channel('tags',{
 async get(_,answer){
     answer('post',(await db.all()).map(e => ({hash: e.hash, tags: e.tags})))
 },
 async post(data){
     for(let entry of data) {
         db.entries[entry.hash] = entry
     }
 }
})
```
