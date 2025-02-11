import { IDBStore, PeerStore } from "./src/idb"

class AuroraDB {
      /**
      * AuroraDB
      * @param {Object} scheme SchemeObjects
      * @example new AuroraDB(scheme)
      */
      constructor(scheme) {
        this.db;
        this.scheme = scheme;
        this.connected = false;
        window.auroradb = this;
        this.create(this.scheme.distributed)
    }
    /**
     * Create new or load DB with scheme
     * @param {object} scheme
     * @param {boolean} distributed (optional)
     * @param {string} id (optional)
     * @example await db.create()
     */
    create = async (distributed = false, id = '') => {
        if (distributed) {
            const peerdb = new PeerStore(this.scheme,id);
            peerdb.net.channel(this.scheme.name, {
                async get(_, answer) {                    // Someone asks for DB
                    answer('post', (await peerdb.all())); // Send ours back
                },
                async post(data) {       // Someone sent a DB
                    const onpost = new CustomEvent("post", {detail: data});
                    peerdb.dispatchEvent(onpost)
                    peerdb.concat(data); // Combine the sent data with our DB
                }
            });
            this.db = peerdb;
            this.connected = true;
        } else {
            this.db = new IDBStore(this.scheme);
        }
    }
    /**
     * Destroy exiting DB
     * @example await db.destroy()
     */
    destroy = async () => { 
        var req = indexedDB.deleteDatabase(this.scheme.name);
        req.onsuccess = function () {
            console.info("Database deleted successfully");
        };
        req.onerror = function () {
            console.info("Couldn't delete database");
        };
        req.onblocked = function () {
            console.info("Couldn't delete database due to the operation being blocked");
        };
    }
    /**
     * Add to DB
     * @param {string|number} key
     * @param {string|number} data
     * @example await db.add(0,"Player1")
     */
    add = async (key, data) => {
        this.db.entries[key] = { name: data };
    }
    /**
     * Get from DB
     * @param {string|number} key
     * @example await db.get(0)
     */
    get = async (key) => {
        return await this.db.entries[key]
    }
    /**
     * Remove key from DB
     * @param {string|number} key
     * @example await db.remove(0)
     */
    remove = async (key) => {
       delete this.db.entries[key];
    }
    /**
     * Filter DB and return new Array of results.
     * @param {Function} fn
     * @example await db.filter(e => e.name[0] == 'J') // Get records of all users whose name begins with "J"
     */
    filter = async (fn) => {
        return this.db.filter(fn)
    }
    /**
     * Verify that all DB entries satisfy the condition 'fn'.
     * @param {Function} fn 
     * @example await db.every(e => e.name[0] == 'J') // Check if all users have a name starting with "J"
     */
    every = async (fn) => {
        return this.db.every(fn)
    }
    /**
     * Slice DB.
     * 
     * Useful for pagination.
     * @param {Number} start
     * @param {Number} end
     * @example await db.slice(0,10) // Get the first 10 entries
     */
    slice = async (from, numOfEntries) => {
        return this.db.slice(from, numOfEntries)
    }
    /**
     * 
     * Get all entries.
     * @example await db.all()
     */
    all = async () => {
        return await this.db.all()
    }
    /**
     * Store transaction.
     * @param {Function} fn
     * @example await db.transaction(db => { db.entries['foo'] = {name: 'foo'}; db.entries['bar'] = {name: 'bar'}})
     */
    transaction = async (fn) => {
        return await this.db.transaction(fn)
    }
    /**
     * 
     * Post our DB to peers
     * @example await db.post()
     */
    post = async () => {
        if (!this.connected) {
            console.error("Error syncing. Not connected.");
            return
        }
        const entries = await this.db.all();
        await this.db.net.broadcast(this.scheme.name, 'post', entries);
    }
    /**
     * 
     * Fetch DBs from our peers
     * @example await db.fetch()
     */
    fetch = async () => {
        if (!this.connected) {
            console.error("Error fetching. Not connected.");
            return
        }
        await this.db.net.broadcast(this.scheme.name, 'get');
    }

}

export default AuroraDB;