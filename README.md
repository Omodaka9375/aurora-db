# AuroraDB 🌅

**A distributed peer-to-peer database built on IndexedDB with pluggable P2P servers**

AuroraDB is a lightweight, high-performance database that combines the reliability of IndexedDB with the power of peer-to-peer networking. Build decentralized applications with real-time data synchronization across multiple clients.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.1-blue.svg)](#)
[![Browser Support](https://img.shields.io/badge/browsers-Chrome%2060%2B%20%7C%20Firefox%2055%2B%20%7C%20Safari%2013%2B-brightgreen.svg)](#browser-support)

## 🚀 Quick Start

### Installation

```html
<!-- Include PeerJS (default P2P adapter) -->
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<!-- Include AuroraDB -->
<script src="auroradb.js"></script>
```

### Basic Usage

```javascript
// Create a local database
const db = new AuroraDB({
    name: 'myapp',
    version: 1,
    keyPath: 'id'
});

await db.create();

// Add data
await db.add('user1', { 
    name: 'Alice', 
    email: 'alice@example.com',
    role: 'developer' 
});

// Get data
const user = await db.get('user1');

// Query data
const developers = await db.filter(user => user.role === 'developer');
```

### Distributed P2P Database

```javascript
// Create distributed database with automatic sync
const db = new AuroraDB({
    name: 'collaborative-app',
    distributed: true,
    autoSync: true,
    syncInterval: 10000
});

await db.create();

// Data automatically syncs across all connected peers!
await db.add('task1', { 
    title: 'Review PR', 
    assignee: 'Bob',
    status: 'pending' 
});

// Listen for sync events
db.addEventListener('sync', (event) => {
    console.log('Synced with', event.detail.sent, 'peers');
});
```

## 🏗️ Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Application   │    │   Application   │
│     Layer       │    │     Layer       │    │     Layer       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AuroraDB      │◄──►│   AuroraDB      │◄──►│   AuroraDB      │
│   Instance      │    │   Instance      │    │   Instance      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   P2P Adapter   │    │   P2P Adapter   │    │   P2P Adapter   │
│   (PeerJS)      │    │   (WebRTC)      │    │  (Socket.IO)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IndexedDB     │    │   IndexedDB     │    │   IndexedDB     │
│   Storage       │    │   Storage       │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Local Operations** → IndexedDB for persistence
2. **P2P Sync** → Automatic replication across peers
3. **Conflict Resolution** → Configurable merge strategies
4. **Event System** → Real-time notifications

## 📚 API Reference

### Database Configuration

```javascript
const db = new AuroraDB({
    // Required
    name: 'myapp',                    // Database name
    
    // Schema
    version: 1,                       // Schema version
    keyPath: 'id',                    // Primary key field
    indexes: [                        // Secondary indexes
        { name: 'email', unique: true },
        { name: 'category', unique: false }
    ],
    
    // P2P Settings
    distributed: false,               // Enable P2P sync
    p2pAdapter: 'peerjs',            // P2P technology
    autoSync: true,                   // Auto synchronization
    syncInterval: 30000,              // Sync frequency (ms)
    syncStrategy: 'timestamp',        // Conflict resolution
    
    // Performance
    maxConnections: 50,               // Max peer connections
    timeout: 10000,                   // Connection timeout
    retryAttempts: 3                  // Retry failed operations
});
```

### Core Operations

#### Database Management

```javascript
// Initialize database
await db.create();                    // Local database
await db.create(true);               // Distributed database
await db.create(true, 'custom-id'); // With custom peer ID

// Database info
db.getStats();                       // Get database statistics
db.isDistributed();                 // Check if P2P enabled
db.getConnectionCount();            // Number of connected peers
db.getPeerId();                     // Local peer ID

// Cleanup
await db.destroy();                 // Delete database completely
```

#### Data Operations

```javascript
// Create
await db.add('key1', { name: 'Alice', age: 30 });
await db.add('key2', { name: 'Bob', age: 25 });

// Read
const user = await db.get('key1');
const allUsers = await db.all();
const count = await db.count();

// Update (same as add)
await db.add('key1', { name: 'Alice Smith', age: 31 });

// Delete
await db.remove('key1');
await db.clear();  // Remove all data
```

#### Query Operations

```javascript
// Filter data
const adults = await db.filter(user => user.age >= 18);
const aliceUsers = await db.filter(user => user.name.startsWith('Alice'));

// Pagination
const page1 = await db.slice(0, 10);   // First 10 items
const page2 = await db.slice(10, 20);  // Next 10 items

// Validation
const allAdults = await db.every(user => user.age >= 18);

// Complex queries
const activeDevs = await db.filter(user => 
    user.role === 'developer' && 
    user.status === 'active' &&
    user.lastLogin > Date.now() - 86400000 // Last 24h
);
```

#### Batch Operations

```javascript
// Atomic transactions
await db.transaction(async (db) => {
    db.entries['user1'] = { name: 'Alice', role: 'admin' };
    db.entries['user2'] = { name: 'Bob', role: 'user' };
    delete db.entries['user3'];
    // All operations succeed or fail together
});

// Batch inserts (for IDBStore instances)
const entries = [
    ['key1', { name: 'Alice' }],
    ['key2', { name: 'Bob' }],
    ['key3', { name: 'Charlie' }]
];
await db.db.batchSet(entries);
```

### P2P Operations

```javascript
// Manual sync
await db.sync();

// Broadcast data to peers
const peersSent = await db.post();

// Request data from peers  
const peersRequested = await db.fetch();

// Network status
const isConnected = db.isDistributed();
const peerCount = db.getConnectionCount();
const myId = db.getPeerId();
```

### Event System

```javascript
// Database events
db.addEventListener('open', () => {
    console.log('Database ready');
});

db.addEventListener('close', () => {
    console.log('Database closed');
});

db.addEventListener('error', (event) => {
    console.error('Database error:', event.detail);
});

// Data events
db.addEventListener('change', () => {
    console.log('Data modified');
});

db.addEventListener('set', () => {
    console.log('Data added/updated');
});

db.addEventListener('delete', () => {
    console.log('Data deleted');
});

// P2P events
db.addEventListener('connection', (event) => {
    console.log('Peer connected:', event.detail.peerId);
});

db.addEventListener('disconnect', () => {
    console.log('Peer disconnected');
});

db.addEventListener('sync', (event) => {
    console.log('Sync completed:', event.detail);
});

// Custom events (for distributed apps)
db.addEventListener('post', (event) => {
    console.log('Received data from peer:', event.detail);
});
```

## 🔌 P2P Adapters

AuroraDB supports multiple P2P technologies through a pluggable adapter system:

### 1. PeerJS (Default)

```javascript
const db = new AuroraDB({
    name: 'myapp',
    distributed: true,
    p2pAdapter: 'peerjs',
    server: {
        host: 'localhost',
        port: 9000,
        path: '/myapp'
    }
});
```

**Use Cases:**
- Quick prototyping
- Simple P2P applications
- WebRTC without server setup

### 2. Custom WebRTC

```javascript
const db = new AuroraDB({
    name: 'myapp',
    distributed: true,
    p2pAdapter: 'webrtc',
    p2pConfig: {
        signalingServer: 'wss://my-signaling-server.com',
        rtcConfig: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:turn.example.com:3478',
                    username: 'user',
                    credential: 'pass'
                }
            ]
        }
    }
});
```

**Use Cases:**
- Custom signaling servers
- Enterprise deployments
- Advanced WebRTC configurations

### 3. Socket.IO

```javascript
const db = new AuroraDB({
    name: 'myapp',
    distributed: true,
    p2pAdapter: 'socketio',
    p2pConfig: {
        serverUrl: 'https://my-socketio-server.com',
        rooms: ['app-room', 'user-room']
    }
});
```

**Use Cases:**
- Existing Socket.IO infrastructure
- Room-based communication
- Server-mediated messaging

### 4. Custom Adapter

```javascript
class MyCustomAdapter extends AuroraDB.P2PAdapter {
    async connect() {
        // Initialize connection
        this.socket = new WebSocket('wss://my-server.com');
        
        this.socket.onopen = () => {
            this.isConnected = true;
            this.emit('open', this.getId());
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.emit('message', {
                from: data.from,
                data: data.payload,
                connection: this.socket
            });
        };
    }
    
    send(peerId, data) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify({
                to: peerId,
                from: this.getId(),
                payload: data
            }));
            return true;
        }
        return false;
    }
    
    broadcast(data) {
        return this.send('*', data) ? 1 : 0;
    }
    
    async listPeers() {
        // Return array of peer IDs
        return [];
    }
    
    async connectToPeer(peerId) {
        // Return connection object
        return this.socket;
    }
    
    async disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.isConnected = false;
    }
    
    async destroy() {
        await this.disconnect();
    }
}

// Register custom adapter
AuroraDB.registerP2PAdapter('mycustom', MyCustomAdapter);

// Use custom adapter
const db = new AuroraDB({
    name: 'myapp',
    distributed: true,
    p2pAdapter: 'mycustom',
    p2pConfig: {
        customOption: 'value'
    }
});
```

### List Available Adapters

```javascript
console.log(AuroraDB.listP2PAdapters());
// Output: ['peerjs', 'webrtc', 'socketio', 'mycustom']
```

## ⚙️ Configuration Options

### Sync Strategies

```javascript
const db = new AuroraDB({
    name: 'myapp',
    distributed: true,
    syncStrategy: 'merge', // Conflict resolution strategy
});
```

**Available Strategies:**
- `timestamp` - Latest modification wins (default)
- `version` - Highest version number wins
- `merge` - Merge conflicting objects
- `local-wins` - Local changes always win
- `remote-wins` - Remote changes always win

### Advanced Configuration

```javascript
const db = new AuroraDB({
    name: 'enterprise-app',
    version: 2,
    keyPath: 'uuid',
    
    // Indexes for performance
    indexes: [
        { name: 'email', unique: true },
        { name: 'department', unique: false },
        { name: 'createdAt', unique: false },
        { name: 'status', unique: false }
    ],
    
    // P2P Configuration
    distributed: true,
    p2pAdapter: 'peerjs',
    autoSync: true,
    syncInterval: 15000,
    syncStrategy: 'merge',
    
    // Connection Management
    maxConnections: 100,
    connectionTimeout: 20000,
    peerConnectionTimeout: 15000,
    maxReconnectAttempts: 5,
    reconnectDelay: 2000,
    
    // Performance
    cacheSize: 2000,
    enableCache: true,
    retryAttempts: 5,
    timeout: 15000,
    
    // Custom P2P Configuration
    p2pConfig: {
        customSetting: 'value'
    }
});
```

## 🎯 Use Cases & Examples

### 1. Collaborative Document Editor

```javascript
const documentDB = new AuroraDB({
    name: 'collaborative-docs',
    distributed: true,
    syncStrategy: 'merge',
    syncInterval: 1000 // Fast sync for real-time collaboration
});

await documentDB.create();

// Add document
await documentDB.add('doc1', {
    title: 'Meeting Notes',
    content: 'Initial content...',
    lastModified: Date.now(),
    collaborators: ['user1', 'user2']
});

// Listen for changes from other users
documentDB.addEventListener('sync', async () => {
    const doc = await documentDB.get('doc1');
    updateEditor(doc.content);
});

// Update document
async function updateDocument(newContent) {
    const doc = await documentDB.get('doc1');
    await documentDB.add('doc1', {
        ...doc,
        content: newContent,
        lastModified: Date.now()
    });
}
```

### 2. Multiplayer Game State

```javascript
const gameDB = new AuroraDB({
    name: 'multiplayer-game',
    distributed: true,
    syncStrategy: 'timestamp',
    syncInterval: 100 // Very fast sync for gaming
});

await gameDB.create();

// Player actions
async function updatePlayerPosition(playerId, x, y) {
    await gameDB.add(`player_${playerId}`, {
        id: playerId,
        x: x,
        y: y,
        timestamp: Date.now(),
        action: 'move'
    });
}

// Game state synchronization
gameDB.addEventListener('change', async () => {
    const players = await gameDB.filter(item => 
        item.id && item.id.startsWith('player_')
    );
    renderPlayers(players);
});
```

### 3. Offline-First E-commerce

```javascript
const inventoryDB = new AuroraDB({
    name: 'inventory-system',
    distributed: true,
    syncStrategy: 'version' // Prevent inventory conflicts
});

await inventoryDB.create();

// Add product
await inventoryDB.add('prod1', {
    name: 'Laptop',
    price: 999.99,
    stock: 50,
    version: 1
});

// Purchase (with conflict handling)
async function purchaseProduct(productId, quantity) {
    try {
        await inventoryDB.transaction(async (db) => {
            const product = await db.entries[productId];
            if (product.stock >= quantity) {
                product.stock -= quantity;
                product.version += 1;
                db.entries[productId] = product;
            } else {
                throw new Error('Insufficient stock');
            }
        });
    } catch (error) {
        console.error('Purchase failed:', error);
    }
}
```

### 4. IoT Sensor Network

```javascript
const sensorDB = new AuroraDB({
    name: 'iot-sensors',
    distributed: true,
    autoSync: true,
    syncInterval: 5000
});

await sensorDB.create();

// Add sensor reading
async function recordSensorData(sensorId, reading) {
    const timestamp = Date.now();
    await sensorDB.add(`${sensorId}_${timestamp}`, {
        sensorId,
        value: reading.value,
        unit: reading.unit,
        location: reading.location,
        timestamp,
        deviceId: sensorDB.getPeerId()
    });
}

// Analyze sensor data
async function analyzeSensorData() {
    const lastHour = Date.now() - 3600000;
    const recentReadings = await sensorDB.filter(reading => 
        reading.timestamp > lastHour
    );
    
    const averages = recentReadings.reduce((acc, reading) => {
        if (!acc[reading.sensorId]) acc[reading.sensorId] = [];
        acc[reading.sensorId].push(reading.value);
        return acc;
    }, {});
    
    return Object.entries(averages).map(([sensorId, values]) => ({
        sensorId,
        average: values.reduce((a, b) => a + b) / values.length,
        count: values.length
    }));
}
```

## 🔧 Development Tools

### Debugging

```javascript
// Enable detailed logging
const db = new AuroraDB({
    name: 'debug-app',
    distributed: true,
    debug: true // Enable debug mode
});

// Monitor all events
['open', 'close', 'error', 'change', 'sync', 'connection', 'disconnect']
    .forEach(event => {
        db.addEventListener(event, (e) => {
            console.log(`[${event}]`, e.detail || 'triggered');
        });
    });

// Database introspection
console.log('Database Stats:', db.getStats());
console.log('Available Adapters:', AuroraDB.listP2PAdapters());
```

### Testing

```javascript
// Test helper functions
class AuroraDBTestHelper {
    static async createTestDB(name = 'test-db') {
        const db = new AuroraDB({
            name: `${name}-${Date.now()}`,
            version: 1,
            keyPath: 'id'
        });
        await db.create();
        return db;
    }
    
    static async seedData(db, data) {
        for (const [key, value] of data) {
            await db.add(key, value);
        }
    }
    
    static async cleanup(db) {
        await db.destroy();
    }
}

// Example test
async function testBasicOperations() {
    const db = await AuroraDBTestHelper.createTestDB();
    
    try {
        // Test add
        await db.add('test1', { name: 'Test User' });
        
        // Test get
        const user = await db.get('test1');
        console.assert(user.name === 'Test User', 'Get failed');
        
        // Test filter
        const users = await db.filter(u => u.name.includes('Test'));
        console.assert(users.length === 1, 'Filter failed');
        
        console.log('✅ All tests passed');
    } finally {
        await AuroraDBTestHelper.cleanup(db);
    }
}
```

### Performance Monitoring

```javascript
class PerformanceMonitor {
    constructor(db) {
        this.db = db;
        this.metrics = {
            operations: 0,
            syncEvents: 0,
            errors: 0,
            startTime: Date.now()
        };
        
        this.setupMonitoring();
    }
    
    setupMonitoring() {
        this.db.addEventListener('change', () => {
            this.metrics.operations++;
        });
        
        this.db.addEventListener('sync', () => {
            this.metrics.syncEvents++;
        });
        
        this.db.addEventListener('error', () => {
            this.metrics.errors++;
        });
    }
    
    getReport() {
        const uptime = Date.now() - this.metrics.startTime;
        return {
            uptime: Math.round(uptime / 1000), // seconds
            operations: this.metrics.operations,
            syncEvents: this.metrics.syncEvents,
            errors: this.metrics.errors,
            operationsPerSecond: this.metrics.operations / (uptime / 1000),
            connections: this.db.getConnectionCount()
        };
    }
}

// Usage
const db = new AuroraDB({name: 'monitored-app', distributed: true});
const monitor = new PerformanceMonitor(db);

// Check performance periodically
setInterval(() => {
    console.log('Performance Report:', monitor.getReport());
}, 30000);
```

## 🚦 Error Handling

### Common Error Patterns

```javascript
async function robustDatabaseOperations() {
    try {
        const db = new AuroraDB({
            name: 'robust-app',
            distributed: true
        });
        
        await db.create();
        
        // Handle connection failures
        db.addEventListener('error', (event) => {
            console.error('Database error:', event.detail);
            
            // Implement retry logic or fallback
            if (event.detail.type === 'connection-failed') {
                setTimeout(() => {
                    console.log('Retrying connection...');
                    db.sync().catch(console.error);
                }, 5000);
            }
        });
        
        // Handle sync failures
        db.addEventListener('disconnect', () => {
            console.warn('Lost connection to peers');
            // Switch to offline mode
            enableOfflineMode();
        });
        
        // Graceful degradation
        if (!db.isDistributed()) {
            console.warn('Running in local-only mode');
            showOfflineWarning();
        }
        
    } catch (error) {
        console.error('Failed to initialize database:', error);
        
        // Fallback to localStorage or memory storage
        return initializeFallbackStorage();
    }
}
```

### Validation & Data Integrity

```javascript
// Custom validation
class ValidatedDB extends AuroraDB {
    async add(key, data) {
        // Validate before adding
        if (!this.validateData(data)) {
            throw new Error('Invalid data format');
        }
        
        // Add timestamp and version
        const enhancedData = {
            ...data,
            createdAt: new Date().toISOString(),
            version: 1
        };
        
        return super.add(key, enhancedData);
    }
    
    validateData(data) {
        // Implement your validation logic
        return data && typeof data === 'object';
    }
}

const db = new ValidatedDB({
    name: 'validated-app',
    distributed: true
});
```

## 📊 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome  | 60+     | Full support |
| Firefox | 55+     | Full support |
| Safari  | 13+     | Full support |
| Edge    | 79+     | Full support (Chromium-based) |

### Feature Detection

```javascript
function checkBrowserSupport() {
    const support = {
        indexedDB: 'indexedDB' in window,
        webRTC: 'RTCPeerConnection' in window,
        webSocket: 'WebSocket' in window,
        eventTarget: 'EventTarget' in window
    };
    
    const isSupported = Object.values(support).every(Boolean);
    
    if (!isSupported) {
        console.error('Browser not supported:', support);
        return false;
    }
    
    return true;
}

// Check before initializing
if (checkBrowserSupport()) {
    const db = new AuroraDB({name: 'myapp'});
    // Continue with initialization
} else {
    // Provide fallback or error message
    showUnsupportedBrowserMessage();
}
```

## 🔒 Security Considerations

### Data Sanitization

```javascript
// AuroraDB automatically sanitizes data, but you can add extra validation
const db = new AuroraDB({name: 'secure-app'});

// Override beforeSet for additional security
db.db.beforeSet = (key, value) => {
    // Remove dangerous properties
    const sanitized = { ...value };
    delete sanitized.__proto__;
    delete sanitized.constructor;
    
    // Validate key format
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        throw new Error('Invalid key format');
    }
    
    // Escape HTML content
    if (sanitized.content) {
        sanitized.content = escapeHtml(sanitized.content);
    }
    
    return sanitized;
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### Access Control

```javascript
class SecureDB extends AuroraDB {
    constructor(config, userPermissions) {
        super(config);
        this.userPermissions = userPermissions;
    }
    
    async add(key, data) {
        if (!this.canWrite(key)) {
            throw new Error('Write access denied');
        }
        return super.add(key, data);
    }
    
    async get(key) {
        if (!this.canRead(key)) {
            throw new Error('Read access denied');
        }
        return super.get(key);
    }
    
    canRead(key) {
        return this.userPermissions.read.includes(key) || 
               this.userPermissions.admin;
    }
    
    canWrite(key) {
        return this.userPermissions.write.includes(key) || 
               this.userPermissions.admin;
    }
}

const db = new SecureDB(
    { name: 'secure-app', distributed: true },
    { 
        read: ['public_*'], 
        write: ['user_data_*'], 
        admin: false 
    }
);
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/auroradb.git
cd auroradb

# Open in development environment
# No build process needed - pure JavaScript
```

### Running Tests

```html
<!DOCTYPE html>
<html>
<head>
    <title>AuroraDB Tests</title>
    <script src="auroradb.js"></script>
</head>
<body>
    <script>
        // Your test suite
        async function runTests() {
            console.log('Running AuroraDB tests...');
            await testBasicOperations();
            await testP2PSync();
            await testErrorHandling();
            console.log('✅ All tests completed');
        }
        
        runTests().catch(console.error);
    </script>
</body>
</html>
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of IndexedDB 
- Inspired by modern distributed database systems
- Thanks to all contributors and the open-source community

---

**Made with ❤️ for the developer community**

*Build the future of decentralized applications with AuroraDB*