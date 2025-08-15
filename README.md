# AuroraDB 🌅

**The Universal P2P Database - Now with Multi-Protocol Discovery**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Browser Support](https://img.shields.io/badge/browsers-Chrome%2060%2B%20%7C%20Firefox%2055%2B%20%7C%20Safari%2013%2B-brightgreen.svg)](#browser-support)

AuroraDB is a revolutionary distributed peer-to-peer database that automatically discovers and connects to peers across multiple networks and protocols. Built on IndexedDB with universal discovery capabilities, it enables truly decentralized applications that work anywhere, anytime.

## 🚀 What's New in v3.0

### 🌐 Universal Discovery System
- **Multi-Protocol Support**: BitTorrent DHT, MQTT, IPFS, ActivityPub, Discord, and more
- **Automatic Peer Discovery**: Zero-configuration peer finding across diverse networks
- **Smart Fallbacks**: Multiple connection strategies for maximum reliability
- **Security Layer**: End-to-end encrypted discovery with trusted network filtering

### 📡 Supported Discovery Networks
- **🔗 BitTorrent DHT** - Leverage the world's largest P2P network
- **📡 MQTT Brokers** - Connect through IoT infrastructure
- **🌐 IPFS Network** - Integrate with the distributed web
- **📱 Mastodon/ActivityPub** - Discover peers on social networks
- **💬 Discord Communities** - Use gaming communities for discovery
- **🔌 Custom Protocols** - Build your own discovery adapters

---

## 🎯 Quick Start

### Installation

```html
<!-- Include PeerJS (default P2P adapter) -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<!-- Include AuroraDB v3.0 -->
<script src="auroradb.js"></script>
```

### Basic Usage - Universal Discovery

```javascript
// Create database with automatic multi-protocol discovery
const db = new AuroraDB({
    name: 'my-universal-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [
                {
                    type: 'bittorrent-dht',
                    config: { namespace: 'my-app-network' }
                },
                {
                    type: 'mqtt',
                    config: { 
                        brokerUrl: 'wss://broker.hivemq.com:8000/mqtt',
                        namespace: 'my-app'
                    }
                },
                {
                    type: 'ipfs',
                    config: { namespace: 'my-app-ipfs' }
                }
            ],
            security: {
                encryption: true,
                passphrase: 'your-secure-passphrase',
                trustedNetworks: ['mqtt', 'ipfs', 'bittorrent-dht']
            }
        }
    }
});

// Initialize and start discovering peers automatically
await db.create();

// Add data - automatically syncs across all discovered peers
await db.add('user1', {
    name: 'Alice',
    email: 'alice@example.com',
    status: 'online'
});

// Listen for discovery events
db.addEventListener('peer-discovered', (event) => {
    console.log(`🔍 Found peer via ${event.detail.discoveryMethod}`);
});

// Monitor network statistics
setInterval(() => {
    console.log('📊 Network Stats:', db.getDiscoveryStats());
}, 30000);
```

### Traditional PeerJS Mode (Still Supported)

```javascript
// Classic PeerJS mode for simple applications
const db = new AuroraDB({
    name: 'simple-app',
    distributed: true,
    p2pAdapter: 'peerjs'  // Default adapter
});

await db.create();
```

---

## 🌐 Discovery Protocols

### 1. BitTorrent DHT Discovery

```javascript
const db = new AuroraDB({
    name: 'torrent-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'bittorrent-dht',
                config: {
                    namespace: 'my-app-network',
                    port: 6881,
                    dhtNodes: [
                        'router.bittorrent.com:6881',
                        'dht.transmissionbt.com:6881'
                    ]
                }
            }]
        }
    }
});
```

**Use Cases:**
- Large-scale P2P applications
- Decentralized file sharing
- Global peer networks
- Censorship-resistant applications

### 2. MQTT Broker Discovery

```javascript
const db = new AuroraDB({
    name: 'iot-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'mqtt',
                config: {
                    brokerUrl: 'wss://iot.eclipse.org:443/ws',
                    namespace: 'iot-sensors',
                    username: 'sensor',
                    password: 'sensor123'
                }
            }]
        }
    }
});
```

**Use Cases:**
- IoT device networks
- Smart home applications
- Industrial monitoring
- Real-time sensor data

### 3. IPFS Network Discovery

```javascript
const db = new AuroraDB({
    name: 'dweb-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'ipfs',
                config: {
                    namespace: 'my-app-ipfs',
                    swarmAddresses: [
                        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                    ]
                }
            }]
        }
    }
});
```

**Use Cases:**
- Distributed web applications
- Content-addressed storage
- Decentralized websites
- Blockchain integration

### 4. Social Network Discovery

```javascript
// Mastodon/ActivityPub Discovery
const db = new AuroraDB({
    name: 'social-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'activitypub',
                config: {
                    instanceUrl: 'https://mastodon.social',
                    hashtag: '#MyAppP2P',
                    accessToken: 'your-mastodon-token'
                }
            }]
        }
    }
});

// Discord Discovery
const discordDB = new AuroraDB({
    name: 'gaming-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'discord',
                config: {
                    channelId: 'your-discord-channel-id',
                    guildId: 'your-discord-guild-id',
                    botToken: 'your-bot-token'
                }
            }]
        }
    }
});
```

**Use Cases:**
- Community-driven applications
- Gaming networks
- Social collaboration tools
- Niche network discovery

---

## 🎮 Real-World Examples

### 1. Collaborative Document Editor

```javascript
const documentDB = new AuroraDB({
    name: 'collaborative-docs',
    distributed: true,
    p2pAdapter: 'universal',
    syncStrategy: 'merge',
    syncInterval: 1000,
    p2pConfig: {
        discoveryConfig: {
            methods: [
                { type: 'bittorrent-dht', config: { namespace: 'doc-editor' } },
                { type: 'activitypub', config: { 
                    instanceUrl: 'https://mastodon.social',
                    hashtag: '#DocEditor'
                }}
            ]
        }
    }
});

await documentDB.create();

// Real-time document synchronization across all peers
async function updateDocument(docId, content) {
    await documentDB.add(docId, {
        content,
        lastModified: Date.now(),
        author: documentDB.getPeerId()
    });
}

// Auto-sync document changes
documentDB.addEventListener('sync', () => {
    console.log('Document synchronized across network');
});
```

### 2. IoT Sensor Network

```javascript
const sensorDB = new AuroraDB({
    name: 'iot-sensors',
    distributed: true,
    p2pAdapter: 'universal',
    syncInterval: 5000,
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'mqtt',
                config: {
                    brokerUrl: 'wss://iot.eclipse.org:443/ws',
                    namespace: 'smart-home',
                    username: process.env.MQTT_USER,
                    password: process.env.MQTT_PASS
                }
            }],
            security: {
                encryption: true,
                passphrase: process.env.IOT_PASSPHRASE
            }
        }
    }
});

await sensorDB.create();

// Record sensor data
async function recordSensorData(sensorId, value, unit) {
    const timestamp = Date.now();
    await sensorDB.add(`${sensorId}_${timestamp}`, {
        sensorId,
        value,
        unit,
        timestamp,
        deviceId: sensorDB.getPeerId(),
        location: 'living-room'
    });
}

// Analyze distributed sensor data
async function getAverageTemperature(hours = 24) {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const readings = await sensorDB.filter(reading => 
        reading.sensorId?.includes('temp') && 
        reading.timestamp > cutoff
    );
    
    const sum = readings.reduce((acc, reading) => acc + reading.value, 0);
    return sum / readings.length;
}
```

### 3. Decentralized Gaming Network

```javascript
const gameDB = new AuroraDB({
    name: 'multiplayer-game',
    distributed: true,
    p2pAdapter: 'universal',
    syncStrategy: 'timestamp',
    syncInterval: 100, // Real-time gaming
    p2pConfig: {
        discoveryConfig: {
            methods: [
                { type: 'bittorrent-dht', config: { namespace: 'game-network' } },
                { type: 'discord', config: { 
                    channelId: 'game-channel-id',
                    guildId: 'game-server-id'
                }}
            ]
        }
    }
});

await gameDB.create();

// Game state management
class GameState {
    static async updatePlayer(playerId, position, health) {
        await gameDB.add(`player_${playerId}`, {
            id: playerId,
            position,
            health,
            timestamp: Date.now(),
            lastAction: 'update'
        });
    }
    
    static async getAllPlayers() {
        return await gameDB.filter(item => 
            item.id?.startsWith('player_')
        );
    }
    
    static async createGameSession(sessionId, maxPlayers = 10) {
        await gameDB.add(`session_${sessionId}`, {
            id: sessionId,
            maxPlayers,
            currentPlayers: 0,
            status: 'waiting',
            createdAt: new Date().toISOString()
        });
    }
}

// Real-time game synchronization
gameDB.addEventListener('change', async () => {
    const players = await GameState.getAllPlayers();
    renderGameState(players);
});
```

### 4. Supply Chain Tracking

```javascript
const supplyDB = new AuroraDB({
    name: 'supply-chain',
    distributed: true,
    p2pAdapter: 'universal',
    syncStrategy: 'version', // Prevent conflicts
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'mqtt',
                config: {
                    brokerUrl: 'wss://supply-chain-broker.com:8883/mqtt',
                    namespace: 'supply-chain',
                    username: process.env.SUPPLY_USER,
                    password: process.env.SUPPLY_PASS
                }
            }],
            security: {
                encryption: true,
                passphrase: process.env.SUPPLY_CHAIN_KEY,
                trustedNetworks: ['mqtt']
            }
        }
    }
});

await supplyDB.create();

class SupplyChain {
    static async trackProduct(productId, action, location, actor) {
        const product = await supplyDB.get(productId) || {
            id: productId,
            history: [],
            version: 0
        };
        
        product.history.push({
            timestamp: new Date().toISOString(),
            action,
            location,
            actor
        });
        product.currentLocation = location;
        product.version++;
        
        await supplyDB.add(productId, product);
    }
    
    static async getProductHistory(productId) {
        const product = await supplyDB.get(productId);
        return product?.history || [];
    }
    
    static async getProductsByLocation(location) {
        return await supplyDB.filter(product => 
            product.currentLocation === location
        );
    }
}

// Track a product through the supply chain
await SupplyChain.trackProduct('PROD001', 'manufactured', 'Factory A', 'Manufacturer Corp');
await SupplyChain.trackProduct('PROD001', 'shipped', 'Warehouse B', 'Logistics Inc');
await SupplyChain.trackProduct('PROD001', 'delivered', 'Store C', 'Retail Chain');
```

---

## 🔧 API Reference

### Database Configuration

```javascript
const db = new AuroraDB({
    // Basic Settings
    name: 'my-database',              // Required: Database name
    version: 1,                       // Schema version
    keyPath: 'id',                    // Primary key field
    distributed: true,                // Enable P2P synchronization
    
    // P2P Configuration
    p2pAdapter: 'universal',          // Use universal discovery
    autoSync: true,                   // Automatic synchronization
    syncInterval: 30000,              // Sync frequency (ms)
    syncStrategy: 'timestamp',        // Conflict resolution strategy
    
    // Universal Discovery Configuration
    p2pConfig: {
        discoveryConfig: {
            methods: [                // Discovery protocols to use
                {
                    type: 'bittorrent-dht',
                    config: { namespace: 'my-app' }
                },
                {
                    type: 'mqtt',
                    config: {
                        brokerUrl: 'wss://broker.com:8000/mqtt',
                        username: 'user',
                        password: 'pass'
                    }
                }
            ],
            security: {               // Security settings
                encryption: true,
                passphrase: 'secure-key',
                trustedNetworks: ['mqtt', 'bittorrent-dht']
            }
        }
    },
    
    // Advanced Settings
    indexes: [                        // Database indexes
        { name: 'email', unique: true },
        { name: 'category', unique: false }
    ],
    maxConnections: 100,              // Maximum peer connections
    timeout: 15000,                   // Connection timeout
    retryAttempts: 5                  // Retry failed operations
});
```

### Discovery Methods

#### BitTorrent DHT
```javascript
{
    type: 'bittorrent-dht',
    config: {
        namespace: 'app-network',     // Network identifier
        port: 6881,                   // DHT port
        dhtNodes: [                   // Bootstrap nodes
            'router.bittorrent.com:6881',
            'dht.transmissionbt.com:6881'
        ]
    }
}
```

#### MQTT Broker
```javascript
{
    type: 'mqtt',
    config: {
        brokerUrl: 'wss://broker.hivemq.com:8000/mqtt',
        namespace: 'app-namespace',
        username: 'mqtt-user',
        password: 'mqtt-password',
        clientId: 'unique-client-id'  // Optional
    }
}
```

#### IPFS Network
```javascript
{
    type: 'ipfs',
    config: {
        namespace: 'app-ipfs',
        swarmAddresses: [              // IPFS swarm addresses
            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
        ]
    }
}
```

#### ActivityPub/Mastodon
```javascript
{
    type: 'activitypub',
    config: {
        instanceUrl: 'https://mastodon.social',
        hashtag: '#MyAppP2P',
        accessToken: 'mastodon-access-token'
    }
}
```

#### Discord
```javascript
{
    type: 'discord',
    config: {
        channelId: 'discord-channel-id',
        guildId: 'discord-server-id',
        botToken: 'discord-bot-token'
    }
}
```

### Core Operations

```javascript
// Database Management
await db.create();                    // Initialize database
await db.create(true);               // Create distributed database
await db.destroy();                  // Delete database

// Data Operations
await db.add('key', data);           // Add/update data
const item = await db.get('key');    // Get data
await db.remove('key');              // Delete data
await db.clear();                    // Clear all data

// Querying
const items = await db.all();                    // Get all data
const count = await db.count();                 // Count entries
const filtered = await db.filter(item => ...);  // Filter data
const page = await db.slice(0, 10);            // Pagination

// Batch Operations
await db.transaction(async (db) => {
    db.entries['key1'] = data1;
    db.entries['key2'] = data2;
    // All operations are atomic
});

// P2P Operations
await db.sync();                     // Manual synchronization
const sent = await db.post();        // Broadcast data to peers
const requested = await db.fetch();  // Request data from peers

// Network Information
const stats = db.getStats();         // Database statistics
const discoveryStats = db.getDiscoveryStats(); // Discovery statistics
const peerId = db.getPeerId();       // Local peer ID
const connections = db.getConnectionCount();   // Active connections
```

### Event System

```javascript
// Database Events
db.addEventListener('open', () => {
    console.log('Database ready');
});

db.addEventListener('error', (event) => {
    console.error('Database error:', event.detail);
});

db.addEventListener('change', () => {
    console.log('Data modified');
});

// P2P Events
db.addEventListener('connection', (event) => {
    console.log('Peer connected:', event.detail.peerId);
});

db.addEventListener('sync', (event) => {
    console.log('Synchronized with', event.detail.sent, 'peers');
});

// Discovery Events
db.addEventListener('peer-discovered', (event) => {
    console.log(`Discovered peer via ${event.detail.discoveryMethod}`);
});
```

---

## 🔒 Security Features

### Encrypted Discovery

```javascript
const db = new AuroraDB({
    name: 'secure-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            security: {
                encryption: true,
                passphrase: 'your-super-secure-passphrase',
                trustedNetworks: ['mqtt', 'ipfs'],
                
                // Advanced: Trusted peer certificates
                trustedPeers: {
                    'peer-id-1': 'certificate-data-1',
                    'peer-id-2': 'certificate-data-2'
                }
            }
        }
    }
});
```

### Network Filtering

```javascript
// Only trust specific discovery networks
const secureConfig = {
    discoveryConfig: {
        methods: [
            { type: 'mqtt', config: { /* MQTT config */ } },
            { type: 'ipfs', config: { /* IPFS config */ } }
        ],
        security: {
            encryption: true,
            passphrase: 'network-specific-key',
            trustedNetworks: ['mqtt', 'ipfs'], // Only these networks
            blacklistedPeers: ['malicious-peer-id-1'] // Block specific peers
        }
    }
};
```

---

## 📊 Monitoring & Analytics

### Discovery Statistics

```javascript
// Get comprehensive network statistics
const stats = db.getDiscoveryStats();
console.log(stats);
/*
{
    peersDiscovered: 45,
    connectionsAttempted: 38,
    connectionsSuccessful: 32,
    discoveryMethods: 4,
    activeMethods: ['bittorrent-dht', 'mqtt', 'ipfs'],
    peerSources: {
        'bittorrent-dht': 20,
        'mqtt': 15,
        'ipfs': 10
    },
    connectionSuccessRate: '84.2%',
    uptime: 1800000
}
*/
```

### Real-time Monitoring

```javascript
// Create a monitoring dashboard
function createDiscoveryMonitor(database) {
    const monitor = {
        stats: {
            totalDiscovered: 0,
            methodBreakdown: {},
            connectionHealth: []
        },
        
        startMonitoring() {
            // Monitor discovery events
            database.addEventListener('peer-discovered', (event) => {
                this.stats.totalDiscovered++;
                const method = event.detail.discoveryMethod;
                this.stats.methodBreakdown[method] = 
                    (this.stats.methodBreakdown[method] || 0) + 1;
            });
            
            // Periodic health checks
            setInterval(() => {
                const currentStats = database.getDiscoveryStats();
                this.stats.connectionHealth.push({
                    timestamp: Date.now(),
                    connections: database.getConnectionCount(),
                    discovered: currentStats?.peersDiscovered || 0
                });
                
                // Keep only last 100 data points
                if (this.stats.connectionHealth.length > 100) {
                    this.stats.connectionHealth.shift();
                }
                
                console.log('📊 Network Health:', {
                    activeConnections: database.getConnectionCount(),
                    totalDiscovered: this.stats.totalDiscovered,
                    discoveryBreakdown: this.stats.methodBreakdown
                });
            }, 30000);
        },
        
        getHealthReport() {
            return {
                ...this.stats,
                currentConnections: database.getConnectionCount(),
                peerId: database.getPeerId(),
                isHealthy: database.getConnectionCount() > 0
            };
        }
    };
    
    monitor.startMonitoring();
    return monitor;
}

// Usage
const monitor = createDiscoveryMonitor(db);
```

---

## 🔌 Custom Discovery Adapters

Create your own discovery protocol:

```javascript
class CustomDiscoveryAdapter extends EventTarget {
    constructor(config) {
        super();
        this.config = config;
        this.isConnected = false;
    }
    
    async connect() {
        // Implement your connection logic
        console.log('Connecting to custom network...');
        
        // Simulate connection
        setTimeout(() => {
            this.isConnected = true;
            this.dispatchEvent(new CustomEvent('connected'));
            this.startDiscovery();
        }, 1000);
        
        return true;
    }
    
    startDiscovery() {
        // Simulate peer discovery
        setInterval(() => {
            if (Math.random() > 0.5) {
                const peerId = `custom-peer-${Date.now()}`;
                this.dispatchEvent(new CustomEvent('peer-discovered', {
                    detail: {
                        peerId,
                        discoveryMethod: 'custom',
                        endpoints: ['webrtc'],
                        metadata: {
                            customData: 'example',
                            discovered: Date.now()
                        }
                    }
                }));
            }
        }, 10000);
    }
    
    async disconnect() {
        this.isConnected = false;
    }
}

// Register your custom adapter
AuroraDB.registerDiscoveryAdapter('custom', CustomDiscoveryAdapter);

// Use it in your database
const db = new AuroraDB({
    name: 'custom-network-app',
    distributed: true,
    p2pAdapter: 'universal',
    p2pConfig: {
        discoveryConfig: {
            methods: [{
                type: 'custom',
                config: {
                    customSetting: 'value'
                }
            }]
        }
    }
});
```

---

## 📱 Use Cases by Industry

### 🎮 Gaming
- **Real-time multiplayer games** with automatic peer discovery
- **Game asset sharing** through BitTorrent DHT
- **Community matchmaking** via Discord integration

### 🏭 IoT & Industrial
- **Sensor networks** using MQTT discovery
- **Smart city applications** with mesh connectivity
- **Industrial monitoring** with encrypted peer communication

### 🌐 Social & Community
- **Decentralized social networks** with ActivityPub discovery
- **Community collaboration tools** via Discord/forums
- **Content sharing platforms** using IPFS integration

### 📊 Enterprise
- **Supply chain tracking** with secure MQTT networks
- **Document collaboration** across office networks
- **Real-time analytics** with automatic data distribution

### 🚗 Transportation
- **Vehicle-to-vehicle communication** using multiple discovery protocols
- **Fleet management** with MQTT broker discovery
- **Traffic optimization** through P2P data sharing

---

## 🌍 Browser Support

| Browser | Version | Universal Discovery | Notes |
|---------|---------|-------------------|--------|
| Chrome  | 60+     | ✅ Full Support    | Best performance |
| Firefox | 55+     | ✅ Full Support    | All features work |
| Safari  | 13+     | ✅ Full Support    | Requires HTTPS |
| Edge    | 79+     | ✅ Full Support    | Chromium-based |

### Feature Detection

```javascript
function checkAuroraDBSupport() {
    const support = {
        indexedDB: 'indexedDB' in window,
        webRTC: 'RTCPeerConnection' in window,
        webSocket: 'WebSocket' in window,
        eventTarget: 'EventTarget' in window,
        asyncIterator: Symbol.asyncIterator !== undefined
    };
    
    const isSupported = Object.values(support).every(Boolean);
    
    if (!isSupported) {
        console.error('AuroraDB requirements not met:', support);
        return false;
    }
    
    console.log('✅ AuroraDB fully supported');
    return true;
}

// Check before using
if (checkAuroraDBSupport()) {
    const db = new AuroraDB({name: 'my-app'});
    // Continue with initialization
}
```

---

## 🛠️ Development & Testing

### Development Mode

```javascript
// Enable detailed logging for development
const db = new AuroraDB({
    name: 'dev-app',
    distributed: true,
    p2pAdapter: 'universal',
    debug: true, // Enable debug logging
    p2pConfig: {
        discoveryConfig: {
            methods: [
                { type: 'bittorrent-dht', config: { namespace: 'dev-test' } }
            ]
        }
    }
});

// Monitor all events for debugging
['open', 'close', 'error', 'change', 'sync', 'connection', 'disconnect', 'peer-discovered']
    .forEach(event => {
        db.addEventListener(event, (e) => {
            console.log(`[${event.toUpperCase()}]`, e.detail || 'triggered');
        });
    });
```

### Testing Utilities

```javascript
class AuroraDBTestHelper {
    static async createTestDB(name = 'test-db', distributed = true) {
        const db = new AuroraDB({
            name: `${name}-${Date.now()}`,
            version: 1,
            keyPath: 'id',
            distributed,
            p2pAdapter: distributed ? 'universal' : 'peerjs',
            p2pConfig: distributed ? {
                discoveryConfig: {
                    methods: [
                        { type: 'bittorrent-dht', config: { namespace: 'test' } }
                    ]
                }
            } : undefined
        });
        
        await db.create();
        return db;
    }
    
    static async seedTestData(db, count = 10) {
        const data = Array.from({length: count}, (_, i) => [
            `test-${i}`,
            {
                name: `Test Item ${i}`,
                value: Math.random() * 100,
                category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
                timestamp: Date.now() - (i * 1000)
            }
        ]);
        
        await db.transaction(async (db) => {
            for (const [key, value] of data) {
                db.entries[key] = value;
            }
        });
        
        return data;
    }
    
    static async waitForPeers(db, minPeers = 1, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const checkPeers = () => {
                if (db.getConnectionCount() >= minPeers) {
                    resolve(db.getConnectionCount());
                }
            };
            
            db.addEventListener('connection', checkPeers);
            
            setTimeout(() => {
                db.removeEventListener('connection', checkPeers);
                if (db.getConnectionCount() < minPeers) {
                    reject(new Error(`Timeout: Only ${db.getConnectionCount()} peers connected`));
                } else {
                    resolve(db.getConnectionCount());
                }
            }, timeout);
            
            checkPeers(); // Check immediately
        });
    }
    
    static async cleanup(...databases) {
        for (const db of databases) {
            try {
                await db.destroy();
            } catch (error) {
                console.warn('Cleanup failed:', error);
            }
        }
    }
}

// Example test
async function testMultiProtocolDiscovery() {
    const db1 = await AuroraDBTestHelper.createTestDB('peer1');
    const db2 = await AuroraDBTestHelper.createTestDB('peer2');
    
    try {
        // Wait for peers to discover each other
        await Promise.all([
            AuroraDBTestHelper.waitForPeers(db1, 1),
            AuroraDBTestHelper.waitForPeers(db2, 1)
        ]);
        
        // Test data synchronization
        await AuroraDBTestHelper.seedTestData(db1, 5);
        await db1.sync();
        
        // Wait for sync and verify
        await new Promise(resolve => setTimeout(resolve, 2000));
        const db2Data = await db2.all();
        
        console.log(db2Data.length >= 5 ? '✅ Sync test passed' : '❌ Sync test failed');
        
    } finally {
        await AuroraDBTestHelper.cleanup(db1, db2);
    }
}
```

---

## 🚀 Performance Optimization

### Batch Operations

```javascript
// Efficient batch processing
async function bulkDataImport(db, records) {
    const BATCH_SIZE = 100;
    
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        
        await db.transaction(async (db) => {
            for (const record of batch) {
                db.entries[record.id] = record;
            }
        });
        
        // Small delay to prevent blocking
        if (i + BATCH_SIZE < records.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
}
```

### Connection Optimization

```javascript
const optimizedDB = new AuroraDB({
    name: 'optimized-app',
    distributed: true,
    p2pAdapter: 'universal',
    
    // Performance tuning
    syncInterval: 15000,        // Less frequent sync
    maxConnections: 20,         // Limit connections
    timeout: 5000,              // Shorter timeouts
    
    p2pConfig: {
        discoveryConfig: {
            methods: [
                // Use fastest discovery methods first
                { type: 'mqtt', config: { /* ... */ } },
                { type: 'bittorrent-dht', config: { /* ... */ } }
            ]
        }
    }
});
```

---

## 🤝 Contributing

We welcome contributions to AuroraDB! Here's how to get involved:

### Development Setup

```bash
git clone https://github.com/yourusername/auroradb.git
cd auroradb
# No build process needed - pure JavaScript!
```

### Adding New Discovery Protocols

1. Create a new adapter class extending `EventTarget`
2. Implement required methods: `connect()`, `disconnect()`, peer discovery
3. Register your adapter with the discovery system
4. Add tests and documentation

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation
- Create detailed pull request descriptions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PeerJS Team** - For the excellent WebRTC abstraction
- **BitTorrent Protocol** - For inspiring decentralized discovery
- **MQTT Community** - For IoT connectivity standards
- **IPFS Project** - For distributed web infrastructure
- **ActivityPub Community** - For decentralized social networking
- **Open Source Community** - For making this possible

---


**🌅 AuroraDB v3.0 - The Dawn of Universal P2P Applications**

*Build the future of decentralized applications with automatic multi-protocol peer discovery. Connect anywhere, sync everywhere.*

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/auroradb?style=social)](https://github.com/yourusername/auroradb)
[![Follow on Twitter](https://img.shields.io/twitter/follow/auroradb?style=social)](https://twitter.com/auroradb)