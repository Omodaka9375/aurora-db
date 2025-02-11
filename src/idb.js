import './peerjs'

const onconnection = new Event("connection");
const ondisconnect = new Event("disconnect");
const onclose = new Event("close");
const onopen = new Event("open");
const onset = new Event("set");
const ondelete = new Event("delete");
const onchange = new Event("change");

class IDB extends EventTarget {
    /**
     * IDB - Proxy wrapper for IndexedDB
     * @param {Object} scheme SchemeObjects
     * @extends EventTarget
     */
    constructor(scheme){
        super();
        scheme && (this.scheme = scheme);
        let ctx = this;
        this.name = scheme.name;
        this.store; 
        this.peerstore;

        /**
         * Proxy API for manipulating DB.
         * @type {Proxy}
         * @emits onopen
         * @emits onchange
         * @emits onset
         * @emits ondelete
         * @example
         * db.entries[key] = {key: data} // Set entry
         * await db.entries[key] // Get entry
         * delete db.entries[key] // Remove entry
         * for await (let entry of db.entries) {} // Iterate entries
         */
        this.entries = new Proxy({}, {
            set: (_,key,value) => {
                ctx.beforeSet && (value = ctx.beforeSet(key,value));
                return new Promise((resolve,reject) => {
                    let store = ctx.db.transaction(ctx.name,"readwrite").objectStore(ctx.name);
                    store.put({...value,[scheme.keyPath]:key}).onsuccess = event => {
                        resolve(event.target.result);
                        ctx.dispatchEvent(onchange);
                        ctx.dispatchEvent(onset);
                    };
                    store.onerror = err => reject(err);
                })
            },
            get: (_,key) => {
                if(key == Symbol.asyncIterator) return ctx[Symbol.asyncIterator].bind(ctx)
                return new Promise((resolve,reject) => {
                    let store = ctx.db.transaction(ctx.name,"readwrite").objectStore(ctx.name);
                    store.get(key).onsuccess = event => resolve(event.target.result);
                    store.onerror = err => reject(err);
                })
            },
            deleteProperty: (_,key) => {
                ctx.beforeDelete && ctx.beforeDelete(key);
                return new Promise((resolve,reject) => {
                    let store = ctx.db.transaction(ctx.name,"readwrite").objectStore(ctx.name);
                    store.delete(key).onsuccess = event => {
                        resolve(event.target.result);
                        ctx.dispatchEvent(onchange);
                        ctx.dispatchEvent(ondelete);
                    };
                    store.onerror = err => reject(err);
                })
            },
            has: (_,key) => {
                return proxy[key]
            }
        });
       this.open();
    }
    /**
     * Open DB
     * @emits onopen
     * @returns {Promise}
     */
    open(){
        return new Promise( (resolve,reject) => {
            let request = indexedDB.open("AuroraDB/"+ this.name, this.scheme.version);
            
            request.onupgradeneeded = event => {
                this.created = true;
                let db =  event.target.result;
                let store = db.createObjectStore(this.name,{keyPath: this.scheme.keyPath});
                for(let index of this.scheme.indexes){
                    store.createIndex(index.name, index.name,{unique: index.unique});
                }
                this.db = db;
                this.dispatchEvent(onopen);
                resolve(this);
            };
            request.onsuccess = event => {
                if(this.created) return
                this.db = event.target.result;
                this.dispatchEvent(onopen);
                resolve(this);
            };
            request.onerror = () => {
                reject(request.error);
            };
        })
    }

    [Symbol.asyncIterator](){
        const store = this.db.transaction(this.name,"readwrite").objectStore(this.name);
        const reqCursor = store.openCursor();
        const iterationPromise = (reqCursor) => 
            new Promise(resolve => reqCursor.onsuccess = (event) => {
                const cursor = event.target.result;
                resolve([cursor, iterationPromise(reqCursor)]);
            });
            let promise = iterationPromise(reqCursor);
        return {
            async next(){
                const [cursor, nextPromise] = await promise;
                promise = nextPromise;
                if (cursor) {
                    cursor.continue();
                    return Promise.resolve({done: false, value: cursor.value});
                } else {
                    return Promise.resolve({done: true, value: null});
                }
            }
        }
        
    }
}

class IDBStore extends IDB {
    /**
     * Useful add-on for IDB.
     * @param {Object} scheme SchemeObject
     * @extends IDB
     */
    constructor(scheme){
        super(scheme);
    }
    /**
     * Filter DB and return new Array of results.
     * @param {Function} fn
     * @example await users.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
     */
    async filter(fn){
        let result = [];
        for await (let o of this.entries){
            if(fn(o)) result.push(o);
        }
        return result
    }
    /**
     * Verify that all DB entries satisfy the condition 'fn'.
     * @param {Function} fn 
     * @example await users.every(e => e.name[0] == 'J') // Check if all users have a name starting with "J"
     */
    async every(fn){
        for await (let o of this.entries){
            if(!fn(o)) return false
        }
        return true
    }
    /**
     * Slice DB.
     * 
     * Useful for pagination.
     * @param {Number} start
     * @param {Number} end
     * @example await users.slice(0,10) // Get the first 10 entries
     */
    async slice(start,end){
        let result = [];
        let i = 0;
        for await (let entry of this.entries){
            if(i >= start && i <= end){
                result.push(entry);
            }
            if(i == end){
                break;
            }
            i++;
        }
        return result
    }
    /**
     * 
     * Get all entries.
     * @example await users.all()
     */
    async all(){
        let result = [];
        for await (let entry of this.entries){
            result.push(entry);
        }
        return result
    }
    /**
     * ! This method mutates DB !
     * 
     * Concat DB with the array.
     * @param {Array} array Array of entries
     * @example await users.concat([{name: "Jotaro"}])
     */
    async concat(array){
        for(let o of array){
            await (this.entries[o[this.scheme.keyPath]] = o);
        }
    }
    /**
     * IDBStore transaction.
     * @param {Function} fn
     * @example db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
     */
    async transaction(fn){
        let pseudoDB = Object.assign({},this);
        try{
            await fn(pseudoDB);
        }
        catch(e){
            throw e
        }
        await fn(this);
    }
}

class PeerStore extends IDBStore {
    /**
     * @extends IDBStore
     * @param {Object} scheme Scheme Object
     */
    constructor(scheme){
        super(scheme);
        /**
         * @type {NetAdapterObject} net
         * @memberof PeerStore
         */
        const peerid = scheme.id ? scheme.id : self.crypto.randomUUID();
        this.peer = new Peer(peerid, scheme.server);
        this.net = this.#p2padapter(this.peer, this);
        this.peer.on('open', () => this.net.connect());
    }
    /**
     * Peerjs Adapter
     * Responsible for connecting to peers and establishing communication channels between databases
     * @param {Peer} peer PeerJS client
     * @param {IDB} db IDB instance
     * @returns {NetAdapterObject}
     */
    #p2padapter = (peer,db) => ({
        __channels__: [],
        /**
         * Connect to other peers
         * @memberof NetAdapterObject
         */
        connect(){
            peer.on("connection", connection => {
                connection.on('open', () => {
                    db.dispatchEvent(onconnection,connection);
                    connection.on('data',data => {
                        let answer = (method,answerData) => connection.send({header:data.header,method,data:answerData}); 
                        this.__channels__.forEach(ch => ch.header == data.header && ch.methods[data.method](data.data,answer));
                    })
                }),
                connection.on('close', () => {
                  db.dispatchEvent(onclose);
                })
            })
            peer.on('disconnected', () => db.dispatchEvent(ondisconnect));

            peer.listAllPeers(list => {
                if(!list) return 
                for(let id of list){
                    if(id != peer.id) {
                        let connection = peer.connect(id);
                        connection.on('open', () => {
                            db.dispatchEvent(onconnection, connection);
                            connection.on('data', data => {
                                let answer = (method,answerData) => connection.send({header:data.header,method,data:answerData}); 
                                this.__channels__.forEach(ch => ch.header == data.header && ch.methods[data.method](data.data,answer));

                            });
                        });

                    }
                }
            })
        },
        /**
         * Broadcast message to other peers
         * @param {String} header Name of channel
         * @param {String} method Name of method (usually 'get' or 'post')
         * @param {Object} [data] Any object
         * @memberof NetAdapterObject
         * @example db.broadcast('tags','get')
         */
        broadcast(header,method,data){
            for(let c in peer.connections) {
                if(peer.connections[c]){
                    for(let i in peer.connections[c]){
                     peer.connections[c][i].send({header,method,data});
                    }
                }
            }
        },
        /**
         * Create channel
         * @param {String} header Name of channel
         * @param {Object} methods Methods of NetAdapter
         * @memberof NetAdapterObject
         * @example
         * db.net.channel('tags',{
         *  async get(_,answer){
         *      answer('post',(await db.all()).map(e => ({hash: e.hash, tags: e.tags})))
         *  },
         *  async post(data){
         *      for(let entry of data) {
         *          db.entries[entry.hash] = entry
         *      }
         *  }
         * })
         */
        channel(header,methods){
            this.__channels__.push({header,methods});
        }
    })
}

export { IDBStore, PeerStore }