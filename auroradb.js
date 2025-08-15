/**
 * AuroraDB - A distributed peer-to-peer database with universal discovery
 * Version 3.0 - Universal Discovery System
 */
var AuroraDB = (function () {
    'use strict';

    // Import PeerJS from global scope (default)
    const { Peer } = window.peerjs || window;

    /**
     * Security & Privacy Layer
     */
    class SecureDiscoveryLayer {
        constructor() {
            this.encryptionKey = null;
            this.peerCertificates = new Map();
            this.trustedNetworks = new Set();
        }

        async initializeSecurity(config) {
            if (config.passphrase) {
                this.encryptionKey = await this.deriveKey(config.passphrase);
            }
            
            if (config.trustedPeers) {
                for (const [peerId, cert] of Object.entries(config.trustedPeers)) {
                    this.peerCertificates.set(peerId, cert);
                }
            }

            if (config.trustedNetworks) {
                config.trustedNetworks.forEach(network => 
                    this.trustedNetworks.add(network)
                );
            }
        }

        async deriveKey(passphrase) {
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(passphrase),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );

            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode('auroradb-salt'),
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        }

        async encryptDiscoveryData(data) {
            if (!this.encryptionKey) return data;
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encodedData = new TextEncoder().encode(JSON.stringify(data));
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                this.encryptionKey,
                encodedData
            );

            return {
                encrypted: true,
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted))
            };
        }

        async decryptDiscoveryData(encryptedData) {
            if (!encryptedData.encrypted || !this.encryptionKey) {
                return encryptedData;
            }

            try {
                const iv = new Uint8Array(encryptedData.iv);
                const data = new Uint8Array(encryptedData.data);
                
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    this.encryptionKey,
                    data
                );

                return JSON.parse(new TextDecoder().decode(decrypted));
            } catch (error) {
                console.warn('Failed to decrypt discovery data:', error);
                return null;
            }
        }

        validatePeer(peerId, discoveryMethod) {
            // Basic validation - can be extended
            return peerId && peerId.length > 8 && this.trustedNetworks.has(discoveryMethod);
        }
    }

    /**
     * Universal Discovery Adapters
     */

    // BitTorrent DHT Adapter
    class BitTorrentDHTAdapter extends EventTarget {
        constructor(config) {
            super();
            this.config = config;
            this.namespace = config.namespace || 'auroradb';
            this.infoHash = this.generateInfoHash();
            this.isConnected = false;
            this.peers = new Map();
        }

        generateInfoHash() {
            // Simple hash generation for demo
            let hash = 0;
            const str = this.namespace;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(16);
        }

        async connect() {
            try {
                // Simulate DHT connection
                console.log(`🔗 Connecting to BitTorrent DHT with namespace: ${this.namespace}`);
                
                // In real implementation, would use WebTorrent or similar
                setTimeout(() => {
                    this.isConnected = true;
                    this.simulatePeerDiscovery();
                    this.dispatchEvent(new CustomEvent('connected'));
                }, 1000);

                return true;
            } catch (error) {
                console.error('DHT connection failed:', error);
                return false;
            }
        }

        simulatePeerDiscovery() {
            // Simulate finding peers through DHT
            setInterval(() => {
                if (Math.random() > 0.7) {
                    const peerId = `dht-peer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
                    this.dispatchEvent(new CustomEvent('peer-discovered', {
                        detail: {
                            peerId,
                            discoveryMethod: 'bittorrent-dht',
                            endpoints: ['webrtc'],
                            metadata: {
                                infoHash: this.infoHash,
                                discovered: Date.now()
                            }
                        }
                    }));
                }
            }, 10000);
        }

        async disconnect() {
            this.isConnected = false;
            this.peers.clear();
        }
    }

    // MQTT Broker Adapter
    class MQTTDiscoveryAdapter extends EventTarget {
        constructor(config) {
            super();
            this.config = config;
            this.brokerUrl = config.brokerUrl || 'wss://test.mosquitto.org:8081/mqtt';
            this.namespace = config.namespace || 'auroradb';
            this.topic = `auroradb/${this.namespace}/discovery`;
            this.deviceId = `aurora-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
            this.isConnected = false;
        }

        async connect() {
            try {
                console.log(`🔗 Connecting to MQTT broker: ${this.brokerUrl}`);
                
                // Simulate MQTT connection
                setTimeout(() => {
                    this.isConnected = true;
                    this.announcePresence();
                    this.simulateMQTTDiscovery();
                    this.dispatchEvent(new CustomEvent('connected'));
                }, 1500);

                return true;
            } catch (error) {
                console.error('MQTT connection failed:', error);
                return false;
            }
        }

        announcePresence() {
            console.log(`📢 Announcing presence on MQTT topic: ${this.topic}/${this.deviceId}/announce`);
            
            // Simulate announcement
            const announcement = {
                deviceId: this.deviceId,
                peerId: this.deviceId,
                timestamp: Date.now(),
                capabilities: ['webrtc', 'websocket'],
                namespace: this.namespace
            };
            
            console.log('📡 MQTT Announcement:', announcement);
        }

        simulateMQTTDiscovery() {
            setInterval(() => {
                if (Math.random() > 0.6) {
                    const peerId = `mqtt-peer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
                    this.dispatchEvent(new CustomEvent('peer-discovered', {
                        detail: {
                            peerId,
                            discoveryMethod: 'mqtt',
                            endpoints: ['websocket', 'webrtc'],
                            metadata: {
                                broker: this.brokerUrl,
                                topic: this.topic,
                                discovered: Date.now()
                            }
                        }
                    }));
                }
            }, 15000);
        }

        async disconnect() {
            this.isConnected = false;
        }
    }

    // IPFS Discovery Adapter
    class IPFSDiscoveryAdapter extends EventTarget {
        constructor(config) {
            super();
            this.config = config;
            this.namespace = config.namespace || 'auroradb';
            this.isConnected = false;
        }

        async connect() {
            try {
                console.log(`🔗 Connecting to IPFS network with namespace: ${this.namespace}`);
                
                // Simulate IPFS connection
                setTimeout(() => {
                    this.isConnected = true;
                    this.announceToIPFS();
                    this.simulateIPFSDiscovery();
                    this.dispatchEvent(new CustomEvent('connected'));
                }, 2000);

                return true;
            } catch (error) {
                console.error('IPFS connection failed:', error);
                return false;
            }
        }

        announceToIPFS() {
            console.log(`📢 Publishing to IPFS pubsub: /aurora-db/${this.namespace}/discovery`);
        }

        simulateIPFSDiscovery() {
            setInterval(() => {
                if (Math.random() > 0.8) {
                    const peerId = `ipfs-peer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
                    this.dispatchEvent(new CustomEvent('peer-discovered', {
                        detail: {
                            peerId,
                            discoveryMethod: 'ipfs',
                            endpoints: ['libp2p', 'webrtc'],
                            metadata: {
                                namespace: this.namespace,
                                protocol: 'libp2p',
                                discovered: Date.now()
                            }
                        }
                    }));
                }
            }, 20000);
        }

        async disconnect() {
            this.isConnected = false;
        }
    }

    // Mastodon/ActivityPub Discovery Adapter
    class ActivityPubDiscoveryAdapter extends EventTarget {
        constructor(config) {
            super();
            this.config = config;
            this.instanceUrl = config.instanceUrl;
            this.hashtag = config.hashtag || '#AuroraDB';
            this.isConnected = false;
        }

        async connect() {
            try {
                console.log(`🔗 Connecting to ActivityPub instance: ${this.instanceUrl}`);
                console.log(`🏷️ Monitoring hashtag: ${this.hashtag}`);
                
                // Simulate ActivityPub connection
                setTimeout(() => {
                    this.isConnected = true;
                    this.announceOnMastodon();
                    this.simulateActivityPubDiscovery();
                    this.dispatchEvent(new CustomEvent('connected'));
                }, 2500);

                return true;
            } catch (error) {
                console.error('ActivityPub connection failed:', error);
                return false;
            }
        }

        announceOnMastodon() {
            console.log(`📢 Posting to Mastodon with ${this.hashtag}`);
        }

        simulateActivityPubDiscovery() {
            setInterval(() => {
                if (Math.random() > 0.9) {
                    const peerId = `actpub-peer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
                    this.dispatchEvent(new CustomEvent('peer-discovered', {
                        detail: {
                            peerId,
                            discoveryMethod: 'activitypub',
                            endpoints: ['webrtc'],
                            metadata: {
                                instance: this.instanceUrl,
                                hashtag: this.hashtag,
                                discovered: Date.now()
                            }
                        }
                    }));
                }
            }, 25000);
        }

        async disconnect() {
            this.isConnected = false;
        }
    }

    // Discord Discovery Adapter
    class DiscordDiscoveryAdapter extends EventTarget {
        constructor(config) {
            super();
            this.config = config;
            this.channelId = config.channelId;
            this.guildId = config.guildId;
            this.isConnected = false;
        }

        async connect() {
            try {
                console.log(`🔗 Connecting to Discord guild: ${this.guildId}, channel: ${this.channelId}`);
                
                // Simulate Discord connection
                setTimeout(() => {
                    this.isConnected = true;
                    this.announceOnDiscord();
                    this.simulateDiscordDiscovery();
                    this.dispatchEvent(new CustomEvent('connected'));
                }, 1800);

                return true;
            } catch (error) {
                console.error('Discord connection failed:', error);
                return false;
            }
        }

        announceOnDiscord() {
            console.log(`📢 Announcing on Discord channel: ${this.channelId}`);
        }

        simulateDiscordDiscovery() {
            setInterval(() => {
                if (Math.random() > 0.75) {
                    const peerId = `discord-peer-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
                    this.dispatchEvent(new CustomEvent('peer-discovered', {
                        detail: {
                            peerId,
                            discoveryMethod: 'discord',
                            endpoints: ['webrtc'],
                            metadata: {
                                guild: this.guildId,
                                channel: this.channelId,
                                discovered: Date.now()
                            }
                        }
                    }));
                }
            }, 12000);
        }

        async disconnect() {
            this.isConnected = false;
        }
    }

    /**
     * Universal Discovery Manager
     */
    class UniversalDiscoveryManager extends EventTarget {
        constructor(auroraDB) {
            super();
            this.db = auroraDB;
            this.discoveryAdapters = new Map();
            this.peerRegistry = new Map();
            this.connectionAttempts = new Map();
            this.securityLayer = new SecureDiscoveryLayer();
            this.stats = {
                peersDiscovered: 0,
                connectionsAttempted: 0,
                connectionsSuccessful: 0,
                discoveryMethods: 0
            };
        }

        async initialize(config) {
            console.log('🚀 Initializing Universal Discovery System...');
            
            if (config.security) {
                await this.securityLayer.initializeSecurity(config.security);
            }

            // Register built-in discovery adapters
            this.registerDiscoveryAdapters(config.methods || []);
        }

        registerDiscoveryAdapters(methods) {
            const adapterMap = {
                'bittorrent-dht': BitTorrentDHTAdapter,
                'mqtt': MQTTDiscoveryAdapter,
                'ipfs': IPFSDiscoveryAdapter,
                'activitypub': ActivityPubDiscoveryAdapter,
                'discord': DiscordDiscoveryAdapter
            };

            methods.forEach(methodConfig => {
                const AdapterClass = adapterMap[methodConfig.type];
                if (AdapterClass) {
                    const adapter = new AdapterClass(methodConfig.config || {});
                    this.registerDiscoveryMethod(methodConfig.type, adapter);
                }
            });
        }

        registerDiscoveryMethod(name, adapter) {
            this.discoveryAdapters.set(name, adapter);
            this.stats.discoveryMethods++;
            
            adapter.addEventListener('peer-discovered', (event) => {
                this.handlePeerDiscovery(name, event.detail);
            });

            adapter.addEventListener('connected', () => {
                console.log(`✅ ${name} discovery adapter connected`);
            });

            console.log(`📡 Registered discovery method: ${name}`);
        }

        async startDiscovery(methods = ['all']) {
            console.log('🔍 Starting peer discovery...');
            
            const adaptersToStart = methods.includes('all') 
                ? Array.from(this.discoveryAdapters.keys())
                : methods;

            const startPromises = adaptersToStart.map(async (method) => {
                try {
                    const adapter = this.discoveryAdapters.get(method);
                    if (adapter) {
                        await adapter.connect();
                        console.log(`✅ Started discovery via ${method}`);
                    }
                } catch (error) {
                    console.warn(`❌ Failed to start ${method} discovery:`, error);
                }
            });

            await Promise.allSettled(startPromises);
            console.log(`🌐 Discovery started on ${adaptersToStart.length} networks`);
        }

        async handlePeerDiscovery(discoveryMethod, peerInfo) {
            const peerId = peerInfo.peerId;
            
            // Security validation
            if (!this.securityLayer.validatePeer(peerId, discoveryMethod)) {
                console.warn(`🚫 Peer validation failed for ${peerId} via ${discoveryMethod}`);
                return;
            }

            // Decrypt if needed
            if (peerInfo.encrypted) {
                const decryptedInfo = await this.securityLayer.decryptDiscoveryData(peerInfo);
                if (!decryptedInfo) {
                    console.warn(`🔐 Failed to decrypt peer info for ${peerId}`);
                    return;
                }
                Object.assign(peerInfo, decryptedInfo);
            }

            this.stats.peersDiscovered++;
            
            if (!this.peerRegistry.has(peerId)) {
                console.log(`🆕 Discovered new peer: ${peerId.substring(0, 12)}... via ${discoveryMethod}`);
                
                this.peerRegistry.set(peerId, {
                    ...peerInfo,
                    discoveryMethods: [discoveryMethod],
                    firstSeen: Date.now(),
                    connectionAttempts: 0,
                    connected: false
                });
            } else {
                // Update existing peer info
                const existing = this.peerRegistry.get(peerId);
                if (!existing.discoveryMethods.includes(discoveryMethod)) {
                    existing.discoveryMethods.push(discoveryMethod);
                    console.log(`🔄 Peer ${peerId.substring(0, 12)}... now discoverable via ${discoveryMethod}`);
                }
                existing.lastSeen = Date.now();
            }

            // Attempt connection if not already connected
            if (!this.db.peer?.connections?.has(peerId)) {
                this.attemptConnection(peerId);
            }

            this.dispatchEvent(new CustomEvent('peer-discovered', {
                detail: { peerId, discoveryMethod, peerInfo }
            }));
        }

        async attemptConnection(peerId) {
            const peerInfo = this.peerRegistry.get(peerId);
            
            if (peerInfo.connectionAttempts >= 3) {
                console.log(`⏭️ Max connection attempts reached for ${peerId.substring(0, 12)}...`);
                return;
            }

            peerInfo.connectionAttempts++;
            this.stats.connectionsAttempted++;
            
            console.log(`🔗 Attempting connection to ${peerId.substring(0, 12)}... (attempt ${peerInfo.connectionAttempts}/3)`);
            
            try {
                // Try to connect through the main P2P adapter
                if (this.db.peer && typeof this.db.peer.connectToPeer === 'function') {
                    const connection = await this.db.peer.connectToPeer(peerId);
                    if (connection) {
                        peerInfo.connected = true;
                        this.stats.connectionsSuccessful++;
                        console.log(`✅ Successfully connected to ${peerId.substring(0, 12)}...`);
                        
                        this.dispatchEvent(new CustomEvent('peer-connected', {
                            detail: { peerId, connection }
                        }));
                        return;
                    }
                }

                // Fallback connection methods
                await this.tryFallbackConnection(peerId, peerInfo);
                
            } catch (error) {
                console.warn(`❌ Connection failed for ${peerId.substring(0, 12)}...:`, error.message);
            }
        }

        async tryFallbackConnection(peerId, peerInfo) {
            // Simulate fallback connection attempts
            const methods = ['webrtc-fallback', 'websocket-fallback', 'signaling-server'];
            
            for (const method of methods) {
                try {
                    console.log(`🔄 Trying ${method} connection to ${peerId.substring(0, 12)}...`);
                    
                    // Simulate connection attempt
                    if (Math.random() > 0.7) {
                        peerInfo.connected = true;
                        peerInfo.connectionMethod = method;
                        this.stats.connectionsSuccessful++;
                        
                        console.log(`✅ Connected to ${peerId.substring(0, 12)}... via ${method}`);
                        
                        this.dispatchEvent(new CustomEvent('peer-connected', {
                            detail: { peerId, method }
                        }));
                        return true;
                    }
                } catch (error) {
                    console.warn(`${method} failed:`, error);
                }
            }
            
            return false;
        }

        getDiscoveryStats() {
            return {
                ...this.stats,
                activeMethods: Array.from(this.discoveryAdapters.keys()),
                discoveredPeers: this.peerRegistry.size,
                connectedPeers: Array.from(this.peerRegistry.values()).filter(p => p.connected).length,
                peerSources: this.getPeerSourceBreakdown(),
                uptime: Date.now() - (this.startTime || Date.now())
            };
        }

        getPeerSourceBreakdown() {
            const breakdown = {};
            for (const [peerId, info] of this.peerRegistry) {
                for (const method of info.discoveryMethods) {
                    breakdown[method] = (breakdown[method] || 0) + 1;
                }
            }
            return breakdown;
        }

        async stopDiscovery() {
            console.log('🛑 Stopping discovery...');
            
            for (const [name, adapter] of this.discoveryAdapters) {
                try {
                    await adapter.disconnect();
                    console.log(`✅ Stopped ${name} discovery`);
                } catch (error) {
                    console.warn(`❌ Error stopping ${name}:`, error);
                }
            }
        }
    }

    /**
     * Abstract P2P Adapter Interface
     */
    class P2PAdapter extends EventTarget {
        constructor(config) {
            super();
            this.config = config;
            this.id = config.id || this.generateId();
            this.connections = new Map();
            this.isConnected = false;
        }

        generateId() {
            return `aurora-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Abstract methods - must be implemented by concrete adapters
        async connect() { throw new Error('connect() must be implemented'); }
        async disconnect() { throw new Error('disconnect() must be implemented'); }
        async destroy() { throw new Error('destroy() must be implemented'); }
        async listPeers() { throw new Error('listPeers() must be implemented'); }
        async connectToPeer(peerId) { throw new Error('connectToPeer() must be implemented'); }
        send(peerId, data) { throw new Error('send() must be implemented'); }
        broadcast(data) { throw new Error('broadcast() must be implemented'); }

        getId() {
            return this.id;
        }

        getConnections() {
            return Array.from(this.connections.values());
        }

        getConnectionCount() {
            return this.connections.size;
        }

        emit(eventName, data) {
            const event = new CustomEvent(eventName, { detail: data });
            this.dispatchEvent(event);
        }
    }

    /**
     * Universal P2P Adapter
     */
    class UniversalP2PAdapter extends P2PAdapter {
        constructor(config) {
            super(config);
            this.primaryAdapter = null;
            this.discoveryManager = null;
        }

        async connect() {
            try {
                // Initialize primary adapter (PeerJS by default)
                const PrimaryAdapterClass = this.config.primaryAdapter === 'webrtc' 
                    ? WebRTCAdapter 
                    : PeerJSAdapter;
                
                this.primaryAdapter = new PrimaryAdapterClass(this.config);
                await this.primaryAdapter.connect();
                
                // Setup event forwarding
                this.setupEventForwarding();
                
                this.isConnected = true;
                this.emit('open', this.id);
                
                return this.id;
            } catch (error) {
                console.error('Universal adapter connection failed:', error);
                throw error;
            }
        }

        setupEventForwarding() {
            ['connection', 'message', 'disconnect', 'close', 'error'].forEach(eventName => {
                this.primaryAdapter.addEventListener(eventName, (event) => {
                    this.dispatchEvent(new CustomEvent(eventName, { detail: event.detail }));
                });
            });
        }

        async listPeers() {
            return this.primaryAdapter ? this.primaryAdapter.listPeers() : [];
        }

        async connectToPeer(peerId) {
            return this.primaryAdapter ? this.primaryAdapter.connectToPeer(peerId) : null;
        }

        send(peerId, data) {
            return this.primaryAdapter ? this.primaryAdapter.send(peerId, data) : false;
        }

        broadcast(data) {
            return this.primaryAdapter ? this.primaryAdapter.broadcast(data) : 0;
        }

        async disconnect() {
            if (this.primaryAdapter) {
                await this.primaryAdapter.disconnect();
            }
            this.isConnected = false;
        }

        async destroy() {
            if (this.primaryAdapter) {
                await this.primaryAdapter.destroy();
            }
            this.isConnected = false;
        }

        getConnectionCount() {
            return this.primaryAdapter ? this.primaryAdapter.getConnectionCount() : 0;
        }
    }

    /**
     * PeerJS Adapter (Default)
     */
    class PeerJSAdapter extends P2PAdapter {
        constructor(config) {
            super(config);
            this.peer = null;
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
            this.reconnectDelay = config.reconnectDelay || 1000;
        }

        async connect() {
            return new Promise((resolve, reject) => {
                try {
                    this.peer = new Peer(this.id, {
                        debug: 0,
                        ...this.config.server
                    });

                    this.setupPeerHandlers();

                    this.peer.on('open', (id) => {
                        this.id = id;
                        this.isConnected = true;
                        this.reconnectAttempts = 0;
                        this.emit('open', id);
                        resolve(id);
                    });

                    this.peer.on('error', (error) => {
                        this.emit('error', error);
                        if (!this.isConnected) {
                            reject(error);
                        }
                    });

                    // Connection timeout
                    setTimeout(() => {
                        if (!this.isConnected) {
                            reject(new Error('PeerJS connection timeout'));
                        }
                    }, this.config.connectionTimeout || 15000);

                } catch (error) {
                    reject(error);
                }
            });
        }

        setupPeerHandlers() {
            this.peer.on('connection', (connection) => {
                this.handleIncomingConnection(connection);
            });

            this.peer.on('disconnected', () => {
                this.isConnected = false;
                this.emit('disconnect');
                this.attemptReconnect();
            });

            this.peer.on('close', () => {
                this.isConnected = false;
                this.connections.clear();
                this.emit('close');
            });
        }

        handleIncomingConnection(connection) {
            connection.on('open', () => {
                this.connections.set(connection.peer, connection);
                this.emit('connection', {
                    peerId: connection.peer,
                    connection: connection
                });

                connection.on('data', (data) => {
                    this.emit('message', {
                        from: connection.peer,
                        data: data,
                        connection: connection
                    });
                });

                connection.on('close', () => {
                    this.connections.delete(connection.peer);
                    this.emit('peer-disconnect', connection.peer);
                });

                connection.on('error', (error) => {
                    this.emit('peer-error', { peerId: connection.peer, error });
                });
            });
        }

        async disconnect() {
            if (this.peer && !this.peer.destroyed) {
                this.peer.disconnect();
            }
            this.isConnected = false;
            this.connections.clear();
        }

        async destroy() {
            if (this.peer && !this.peer.destroyed) {
                this.peer.destroy();
            }
            this.isConnected = false;
            this.connections.clear();
        }

        async listPeers() {
            return new Promise((resolve) => {
                if (!this.peer || !this.peer.open) {
                    resolve([]);
                    return;
                }

                this.peer.listAllPeers((peers) => {
                    resolve(peers || []);
                });
            });
        }

        async connectToPeer(peerId) {
            if (this.connections.has(peerId)) {
                return this.connections.get(peerId);
            }

            return new Promise((resolve, reject) => {
                try {
                    const connection = this.peer.connect(peerId);
                    
                    const timeout = setTimeout(() => {
                        reject(new Error(`Connection timeout to peer: ${peerId}`));
                    }, this.config.peerConnectionTimeout || 10000);

                    connection.on('open', () => {
                        clearTimeout(timeout);
                        this.connections.set(peerId, connection);
                        
                        connection.on('data', (data) => {
                            this.emit('message', {
                                from: peerId,
                                data: data,
                                connection: connection
                            });
                        });

                        connection.on('close', () => {
                            this.connections.delete(peerId);
                            this.emit('peer-disconnect', peerId);
                        });

                        resolve(connection);
                    });

                    connection.on('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });

                } catch (error) {
                    reject(error);
                }
            });
        }

        send(peerId, data) {
            const connection = this.connections.get(peerId);
            if (connection && connection.open) {
                connection.send(data);
                return true;
            }
            return false;
        }

        broadcast(data) {
            let sent = 0;
            for (const [peerId, connection] of this.connections) {
                if (connection.open) {
                    try {
                        connection.send(data);
                        sent++;
                    } catch (error) {
                        console.error(`Failed to send to ${peerId}:`, error);
                    }
                }
            }
            return sent;
        }

        async attemptReconnect() {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                return;
            }

            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            this.reconnectAttempts++;

            setTimeout(async () => {
                try {
                    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    
                    if (this.peer.destroyed) {
                        this.peer = new Peer(this.id, this.config.server);
                        this.setupPeerHandlers();
                    } else {
                        this.peer.reconnect();
                    }

                    // Wait for reconnection
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => reject(new Error('Reconnection timeout')), 10000);
                        this.peer.on('open', () => {
                            clearTimeout(timeout);
                            this.isConnected = true;
                            this.reconnectAttempts = 0;
                            resolve();
                        });
                    });

                } catch (error) {
                    console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
                    this.attemptReconnect();
                }
            }, delay);
        }
    }

    /**
     * WebRTC Adapter (Alternative implementation)
     */
    class WebRTCAdapter extends P2PAdapter {
        constructor(config) {
            super(config);
            this.signalingServer = config.signalingServer || 'wss://signaling.example.com';
            this.rtcConfig = config.rtcConfig || {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
            this.socket = null;
            this.peerConnections = new Map();
        }

        async connect() {
            return new Promise((resolve, reject) => {
                try {
                    this.socket = new WebSocket(this.signalingServer);

                    this.socket.onopen = () => {
                        this.isConnected = true;
                        this.socket.send(JSON.stringify({
                            type: 'join',
                            peerId: this.id
                        }));
                        this.emit('open', this.id);
                        resolve(this.id);
                    };

                    this.socket.onmessage = (event) => {
                        this.handleSignalingMessage(JSON.parse(event.data));
                    };

                    this.socket.onclose = () => {
                        this.isConnected = false;
                        this.emit('disconnect');
                    };

                    this.socket.onerror = (error) => {
                        this.emit('error', error);
                        reject(error);
                    };

                } catch (error) {
                    reject(error);
                }
            });
        }

        handleSignalingMessage(message) {
            switch (message.type) {
                case 'peers':
                    this.emit('peers-list', message.peers);
                    break;
                case 'offer':
                    this.handleOffer(message.from, message.offer);
                    break;
                case 'answer':
                    this.handleAnswer(message.from, message.answer);
                    break;
                case 'ice-candidate':
                    this.handleIceCandidate(message.from, message.candidate);
                    break;
            }
        }

        async handleOffer(from, offer) {
            const pc = this.createPeerConnection(from);
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            this.socket.send(JSON.stringify({
                type: 'answer',
                to: from,
                answer: answer
            }));
        }

        async handleAnswer(from, answer) {
            const pc = this.peerConnections.get(from);
            if (pc) {
                await pc.setRemoteDescription(answer);
            }
        }

        handleIceCandidate(from, candidate) {
            const pc = this.peerConnections.get(from);
            if (pc) {
                pc.addIceCandidate(candidate);
            }
        }

        createPeerConnection(peerId) {
            const pc = new RTCPeerConnection(this.rtcConfig);
            this.peerConnections.set(peerId, pc);

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.send(JSON.stringify({
                        type: 'ice-candidate',
                        to: peerId,
                        candidate: event.candidate
                    }));
                }
            };

            pc.ondatachannel = (event) => {
                const channel = event.channel;
                this.setupDataChannel(peerId, channel);
            };

            return pc;
        }

        setupDataChannel(peerId, channel) {
            channel.onopen = () => {
                this.connections.set(peerId, channel);
                this.emit('connection', { peerId, connection: channel });
            };

            channel.onmessage = (event) => {
                this.emit('message', {
                    from: peerId,
                    data: JSON.parse(event.data),
                    connection: channel
                });
            };

            channel.onclose = () => {
                this.connections.delete(peerId);
                this.emit('peer-disconnect', peerId);
            };
        }

        async disconnect() {
            if (this.socket) {
                this.socket.close();
            }
            for (const pc of this.peerConnections.values()) {
                pc.close();
            }
            this.peerConnections.clear();
            this.connections.clear();
            this.isConnected = false;
        }

        async destroy() {
            await this.disconnect();
        }

        async listPeers() {
            return new Promise((resolve) => {
                if (!this.isConnected) {
                    resolve([]);
                    return;
                }

                this.socket.send(JSON.stringify({ type: 'list-peers' }));
                
                const handler = (event) => {
                    this.removeEventListener('peers-list', handler);
                    resolve(event.detail);
                };
                
                this.addEventListener('peers-list', handler);
                
                setTimeout(() => {
                    this.removeEventListener('peers-list', handler);
                    resolve([]);
                }, 5000);
            });
        }

        async connectToPeer(peerId) {
            if (this.connections.has(peerId)) {
                return this.connections.get(peerId);
            }

            const pc = this.createPeerConnection(peerId);
            const channel = pc.createDataChannel('data');
            this.setupDataChannel(peerId, channel);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            this.socket.send(JSON.stringify({
                type: 'offer',
                to: peerId,
                offer: offer
            }));

            return new Promise((resolve) => {
                const handler = (event) => {
                    if (event.detail.peerId === peerId) {
                        this.removeEventListener('connection', handler);
                        resolve(event.detail.connection);
                    }
                };
                this.addEventListener('connection', handler);
            });
        }

        send(peerId, data) {
            const connection = this.connections.get(peerId);
            if (connection && connection.readyState === 'open') {
                connection.send(JSON.stringify(data));
                return true;
            }
            return false;
        }

        broadcast(data) {
            let sent = 0;
            for (const [peerId, connection] of this.connections) {
                if (connection.readyState === 'open') {
                    try {
                        connection.send(JSON.stringify(data));
                        sent++;
                    } catch (error) {
                        console.error(`Failed to send to ${peerId}:`, error);
                    }
                }
            }
            return sent;
        }
    }

    /**
     * P2P Adapter Registry
     */
    class P2PAdapterRegistry {
        constructor() {
            this.adapters = new Map();
            this.registerDefaults();
        }

        registerDefaults() {
            this.register('peerjs', PeerJSAdapter);
            this.register('webrtc', WebRTCAdapter);
            this.register('universal', UniversalP2PAdapter);
        }

        register(name, adapterClass) {
            if (typeof adapterClass !== 'function') {
                throw new Error('Adapter must be a constructor function');
            }
            this.adapters.set(name.toLowerCase(), adapterClass);
        }

        get(name) {
            return this.adapters.get(name.toLowerCase());
        }

        has(name) {
            return this.adapters.has(name.toLowerCase());
        }

        list() {
            return Array.from(this.adapters.keys());
        }

        create(name, config) {
            const AdapterClass = this.get(name);
            if (!AdapterClass) {
                throw new Error(`Unknown P2P adapter: ${name}. Available: ${this.list().join(', ')}`);
            }
            return new AdapterClass(config);
        }
    }

    // Global registry instance
    const p2pRegistry = new P2PAdapterRegistry();

    /**
     * Data Validator for security and data integrity
     */
    class DataValidator {
        static sanitize(data) {
            if (typeof data !== 'object' || data === null) {
                return data;
            }
            
            const clean = JSON.parse(JSON.stringify(data));
            delete clean.__proto__;
            delete clean.constructor;
            delete clean.prototype;
            
            return clean;
        }

        static validate(data, rules = {}) {
            if (!data || typeof data !== 'object') {
                throw new Error('Data must be an object');
            }

            for (const [field, rule] of Object.entries(rules)) {
                if (rule.required && !(field in data)) {
                    throw new Error(`Required field missing: ${field}`);
                }
                
                if (field in data && rule.type && typeof data[field] !== rule.type) {
                    throw new Error(`Field ${field} must be of type ${rule.type}`);
                }

                if (field in data && rule.validate && !rule.validate(data[field])) {
                    throw new Error(`Validation failed for field: ${field}`);
                }
            }
            
            return true;
        }
    }

    /**
     * Conflict Resolution for distributed synchronization
     */
    class ConflictResolver {
        static resolveConflict(local, remote, strategy = 'timestamp') {
            if (!local) return remote;
            if (!remote) return local;

            switch (strategy) {
                case 'timestamp':
                    const localTime = local._timestamp || 0;
                    const remoteTime = remote._timestamp || 0;
                    return localTime >= remoteTime ? local : remote;
                
                case 'version':
                    const localVer = local._version || 0;
                    const remoteVer = remote._version || 0;
                    return localVer >= remoteVer ? local : remote;
                
                case 'merge':
                    return { 
                        ...local, 
                        ...remote,
                        _timestamp: Math.max(local._timestamp || 0, remote._timestamp || 0),
                        _version: Math.max(local._version || 0, remote._version || 0) + 1
                    };
                
                case 'local-wins':
                    return local;
                
                case 'remote-wins':
                    return remote;
                
                default:
                    return local;
            }
        }
    }

    /**
     * Enhanced IDB class
     */
    class IDB extends EventTarget {
        constructor(scheme) {
            super();
            this.validateScheme(scheme);
            this.scheme = scheme;
            this.name = scheme.name;
            this.db = null;
            this.isOpen = false;
            this.maxRetries = 3;
            
            this.entries = this.createEntriesProxy();
            this.open();
        }

        validateScheme(scheme) {
            if (!scheme || typeof scheme !== 'object') {
                throw new Error('Scheme must be an object');
            }

            const required = ['name', 'version', 'keyPath'];
            for (const field of required) {
                if (!scheme[field]) {
                    throw new Error(`Missing required scheme field: ${field}`);
                }
            }

            if (typeof scheme.version !== 'number' || scheme.version < 1) {
                throw new Error('Version must be a positive number');
            }

            if (!scheme.indexes) {
                scheme.indexes = [];
            }
        }

        createEntriesProxy() {
            return new Proxy({}, {
                set: async (_, key, value) => {
                    try {
                        const sanitizedValue = DataValidator.sanitize(value);
                        const timestampedValue = {
                            ...sanitizedValue,
                            [this.scheme.keyPath]: key,
                            _timestamp: Date.now(),
                            _version: (sanitizedValue._version || 0) + 1
                        };

                        const result = await this.performWrite('put', timestampedValue);
                        this.dispatchEvent(new CustomEvent('change'));
                        this.dispatchEvent(new CustomEvent('set'));
                        return result;
                    } catch (error) {
                        this.dispatchEvent(new CustomEvent('error', { detail: error }));
                        throw error;
                    }
                },
                
                get: (_, key) => {
                    if (key === Symbol.asyncIterator) return this[Symbol.asyncIterator].bind(this);
                    if (typeof key === 'symbol') return undefined;
                    
                    return this.performRead('get', key);
                },
                
                deleteProperty: async (_, key) => {
                    try {
                        const result = await this.performWrite('delete', key);
                        this.dispatchEvent(new CustomEvent('change'));
                        this.dispatchEvent(new CustomEvent('delete'));
                        return result;
                    } catch (error) {
                        this.dispatchEvent(new CustomEvent('error', { detail: error }));
                        throw error;
                    }
                }
            });
        }

        async open() {
            if (this.isOpen) return this;

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(`AuroraDB/${this.name}`, this.scheme.version);
                
                request.onupgradeneeded = (event) => {
                    try {
                        this.created = true;
                        const db = event.target.result;
                        
                        if (!db.objectStoreNames.contains(this.name)) {
                            const store = db.createObjectStore(this.name, {
                                keyPath: this.scheme.keyPath
                            });
                            
                            for (const index of this.scheme.indexes) {
                                if (!store.indexNames.contains(index.name)) {
                                    store.createIndex(index.name, index.name, {
                                        unique: index.unique || false
                                    });
                                }
                            }
                        }
                        
                        this.db = db;
                        this.setupDbHandlers();
                    } catch (error) {
                        reject(error);
                    }
                };
                
                request.onsuccess = (event) => {
                    if (this.created) {
                        this.isOpen = true;
                        this.dispatchEvent(new CustomEvent('open'));
                        resolve(this);
                        return;
                    }
                    
                    this.db = event.target.result;
                    this.isOpen = true;
                    this.setupDbHandlers();
                    this.dispatchEvent(new CustomEvent('open'));
                    resolve(this);
                };
                
                request.onerror = () => {
                    const error = new Error(`Failed to open database: ${request.error}`);
                    this.dispatchEvent(new CustomEvent('error', { detail: error }));
                    reject(error);
                };
            });
        }

        setupDbHandlers() {
            this.db.onerror = (event) => {
                const error = new Error(`Database error: ${event.target.error}`);
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
            };

            this.db.onclose = () => {
                this.isOpen = false;
                this.dispatchEvent(new CustomEvent('close'));
            };
        }

        async performRead(operation, key, retries = 0) {
            try {
                if (!this.isOpen) await this.open();
                
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(this.name, 'readonly');
                    const store = transaction.objectStore(this.name);
                    const request = store[operation](key);
                    
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                if (retries < this.maxRetries) {
                    await this.delay(100 * (retries + 1));
                    return this.performRead(operation, key, retries + 1);
                }
                throw error;
            }
        }

        async performWrite(operation, data, retries = 0) {
            try {
                if (!this.isOpen) await this.open();
                
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(this.name, 'readwrite');
                    const store = transaction.objectStore(this.name);
                    const request = store[operation](data);
                    
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                if (retries < this.maxRetries) {
                    await this.delay(100 * (retries + 1));
                    return this.performWrite(operation, data, retries + 1);
                }
                throw error;
            }
        }

        async* [Symbol.asyncIterator]() {
            if (!this.isOpen) await this.open();
            
            const transaction = this.db.transaction(this.name, 'readonly');
            const store = transaction.objectStore(this.name);
            const request = store.openCursor();
            
            while (true) {
                const cursor = await new Promise((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
                
                if (!cursor) break;
                
                yield cursor.value;
                cursor.continue();
            }
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async close() {
            if (this.db && this.isOpen) {
                this.db.close();
                this.isOpen = false;
                this.dispatchEvent(new CustomEvent('close'));
            }
        }
    }

    /**
     * Enhanced IDBStore with batch operations
     */
    class IDBStore extends IDB {
        constructor(scheme) {
            super(scheme);
        }

        async batchSet(entries) {
            if (!Array.isArray(entries)) {
                throw new Error('Entries must be an array');
            }

            if (!this.isOpen) await this.open();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(this.name, 'readwrite');
                const store = transaction.objectStore(this.name);
                const results = [];
                let completed = 0;
                
                const processNext = () => {
                    if (completed === entries.length) {
                        resolve(results);
                        return;
                    }
                    
                    const [key, value] = entries[completed];
                    const sanitizedValue = DataValidator.sanitize(value);
                    const timestampedValue = {
                        ...sanitizedValue,
                        [this.scheme.keyPath]: key,
                        _timestamp: Date.now(),
                        _version: (sanitizedValue._version || 0) + 1
                    };
                    
                    const request = store.put(timestampedValue);
                    request.onsuccess = () => {
                        results.push(request.result);
                        completed++;
                        processNext();
                    };
                    request.onerror = () => reject(request.error);
                };
                
                transaction.onerror = () => reject(transaction.error);
                processNext();
            });
        }

        async filter(fn) {
            const result = [];
            for await (const entry of this.entries) {
                if (fn(entry)) {
                    result.push(entry);
                }
            }
            return result;
        }

        async every(fn) {
            for await (const entry of this.entries) {
                if (!fn(entry)) {
                    return false;
                }
            }
            return true;
        }

        async slice(start = 0, end = Infinity) {
            const result = [];
            let i = 0;
            
            for await (const entry of this.entries) {
                if (i >= start && i < end) {
                    result.push(entry);
                }
                if (i >= end) {
                    break;
                }
                i++;
            }
            return result;
        }

        async all() {
            const result = [];
            for await (const entry of this.entries) {
                result.push(entry);
            }
            return result;
        }

        async count() {
            if (!this.isOpen) await this.open();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(this.name, 'readonly');
                const store = transaction.objectStore(this.name);
                const request = store.count();
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }

        async clear() {
            if (!this.isOpen) await this.open();
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(this.name, 'readwrite');
                const store = transaction.objectStore(this.name);
                const request = store.clear();
                
                request.onsuccess = () => {
                    this.dispatchEvent(new CustomEvent('change'));
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        }

        async concat(array) {
            if (!Array.isArray(array)) {
                throw new Error('Concat parameter must be an array');
            }

            const entries = array.map(obj => [obj[this.scheme.keyPath], obj]);
            return this.batchSet(entries);
        }

        async transaction(fn) {
            if (typeof fn !== 'function') {
                throw new Error('Transaction function is required');
            }

            const pseudoDB = Object.assign({}, this);
            const operations = [];
            
            pseudoDB.entries = new Proxy({}, {
                set: (_, key, value) => {
                    operations.push({ type: 'set', key, value });
                    return true;
                },
                deleteProperty: (_, key) => {
                    operations.push({ type: 'delete', key });
                    return true;
                }
            });

            try {
                await fn(pseudoDB);
                
                if (!this.isOpen) await this.open();
                
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(this.name, 'readwrite');
                    const store = transaction.objectStore(this.name);
                    let completed = 0;
                    
                    const processNext = () => {
                        if (completed === operations.length) {
                            resolve();
                            return;
                        }
                        
                        const op = operations[completed];
                        let request;
                        
                        if (op.type === 'set') {
                            const sanitizedValue = DataValidator.sanitize(op.value);
                            const timestampedValue = {
                                ...sanitizedValue,
                                [this.scheme.keyPath]: op.key,
                                _timestamp: Date.now(),
                                _version: (sanitizedValue._version || 0) + 1
                            };
                            request = store.put(timestampedValue);
                        } else {
                            request = store.delete(op.key);
                        }
                        
                        request.onsuccess = () => {
                            completed++;
                            processNext();
                        };
                        request.onerror = () => reject(request.error);
                    };
                    
                    transaction.onerror = () => reject(transaction.error);
                    if (operations.length > 0) {
                        processNext();
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                throw new Error(`Transaction failed: ${error.message}`);
            }
        }
    }

    /**
     * Enhanced PeerStore with Universal Discovery
     */
    class PeerStore extends IDBStore {
        constructor(scheme) {
            super(scheme);
            
            // P2P Configuration
            this.p2pAdapter = scheme.p2pAdapter || 'peerjs';
            this.p2pConfig = {
                id: scheme.id,
                server: scheme.server || {},
                connectionTimeout: scheme.connectionTimeout || 15000,
                peerConnectionTimeout: scheme.peerConnectionTimeout || 10000,
                maxReconnectAttempts: scheme.maxReconnectAttempts || 5,
                reconnectDelay: scheme.reconnectDelay || 1000,
                ...scheme.p2pConfig
            };
            
            this.syncStrategy = scheme.syncStrategy || 'timestamp';
            this.autoSync = scheme.autoSync !== false;
            this.syncInterval = scheme.syncInterval || 30000;
            
            this.peer = null;
            this.discoveryManager = null;
            this.syncTimer = null;
            this.isConnected = false;
            this.lastSyncTime = 0;
            
            this.net = this.createNetAdapter();
            this.initializePeer();
        }

        async initializePeer() {
            try {
                // Create P2P adapter
                this.peer = p2pRegistry.create(this.p2pAdapter, this.p2pConfig);
                
                // Initialize Universal Discovery if configured
                if (this.p2pAdapter === 'universal' && this.p2pConfig.discoveryConfig) {
                    this.discoveryManager = new UniversalDiscoveryManager(this);
                    await this.discoveryManager.initialize(this.p2pConfig.discoveryConfig);
                }
                
                this.setupPeerHandlers();
                
                await this.peer.connect();
                this.isConnected = true;
                
                // Start discovery if manager is available
                if (this.discoveryManager) {
                    await this.discoveryManager.startDiscovery();
                } else {
                    await this.connectToPeers();
                }
                
                if (this.autoSync) {
                    this.startAutoSync();
                }
                
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw error;
            }
        }

        setupPeerHandlers() {
            this.peer.addEventListener('open', (event) => {
                console.log(`🌐 Peer connected with ID: ${event.detail}`);
                this.dispatchEvent(new CustomEvent('open', { detail: { peerId: event.detail } }));
            });

            this.peer.addEventListener('connection', (event) => {
                console.log(`🤝 New peer connected: ${event.detail.peerId}`);
                this.dispatchEvent(new CustomEvent('connection', { detail: event.detail }));
            });

            this.peer.addEventListener('message', (event) => {
                this.handleMessage(event.detail.data, event.detail.from, event.detail.connection);
            });

            this.peer.addEventListener('disconnect', () => {
                this.isConnected = false;
                this.dispatchEvent(new CustomEvent('disconnect'));
            });

            this.peer.addEventListener('close', () => {
                this.isConnected = false;
                this.dispatchEvent(new CustomEvent('close'));
            });

            this.peer.addEventListener('error', (event) => {
                this.dispatchEvent(new CustomEvent('error', { detail: event.detail }));
            });

            // Setup discovery manager events if available
            if (this.discoveryManager) {
                this.discoveryManager.addEventListener('peer-discovered', (event) => {
                    console.log(`🔍 Peer discovered via ${event.detail.discoveryMethod}: ${event.detail.peerId.substring(0, 12)}...`);
                });

                this.discoveryManager.addEventListener('peer-connected', (event) => {
                    console.log(`✅ Connected to discovered peer: ${event.detail.peerId.substring(0, 12)}...`);
                });
            }
        }

        async connectToPeers() {
            try {
                const peers = await this.peer.listPeers();
                const myId = this.peer.getId();
                
                const otherPeers = peers.filter(id => id !== myId);
                
                const connectionPromises = otherPeers.map(peerId => 
                    this.peer.connectToPeer(peerId).catch(error => {
                        console.warn(`Failed to connect to peer ${peerId}:`, error);
                        return null;
                    })
                );

                const connections = await Promise.allSettled(connectionPromises);
                const successful = connections.filter(result => 
                    result.status === 'fulfilled' && result.value
                ).length;

                console.log(`Connected to ${successful}/${otherPeers.length} peers`);
                
            } catch (error) {
                console.error('Failed to connect to peers:', error);
            }
        }

        async handleMessage(data, from, connection) {
            try {
                const answer = (method, answerData) => {
                    const response = {
                        header: data.header,
                        method,
                        data: answerData,
                        timestamp: Date.now(),
                        replyTo: data.timestamp
                    };
                    
                    this.peer.send(from, response);
                };

                const channel = this.net.__channels__.find(ch => ch.header === data.header);
                if (channel && channel.methods[data.method]) {
                    await channel.methods[data.method](data.data, answer);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
            }
        }

        createNetAdapter() {
            const self = this;
            
            return {
                __channels__: [],
                
                broadcast(header, method, data) {
                    if (!self.peer || !self.isConnected) {
                        return 0;
                    }

                    const message = {
                        header,
                        method,
                        data,
                        timestamp: Date.now(),
                        sender: self.peer.getId()
                    };

                    return self.peer.broadcast(message);
                },

                channel(header, methods) {
                    if (!header || typeof header !== 'string') {
                        throw new Error('Channel header must be a string');
                    }
                    if (!methods || typeof methods !== 'object') {
                        throw new Error('Channel methods must be an object');
                    }

                    this.__channels__ = this.__channels__.filter(ch => ch.header !== header);
                    this.__channels__.push({ header, methods });
                },

                getConnectionCount() {
                    return self.peer ? self.peer.getConnectionCount() : 0;
                },

                isConnected() {
                    return self.isConnected;
                },

                getPeerId() {
                    return self.peer ? self.peer.getId() : null;
                },

                getAdapter() {
                    return self.p2pAdapter;
                },

                getDiscoveryStats() {
                    return self.discoveryManager ? self.discoveryManager.getDiscoveryStats() : null;
                }
            };
        }

        startAutoSync() {
            if (this.syncTimer) {
                clearInterval(this.syncTimer);
            }

            this.syncTimer = setInterval(async () => {
                try {
                    await this.sync();
                } catch (error) {
                    console.error('Auto-sync failed:', error);
                }
            }, this.syncInterval);
        }

        stopAutoSync() {
            if (this.syncTimer) {
                clearInterval(this.syncTimer);
                this.syncTimer = null;
            }
        }

        async sync() {
            if (!this.isConnected) {
                throw new Error('Not connected to peers');
            }

            const startTime = Date.now();
            
            try {
                const ourData = await this.all();
                const sent = this.net.broadcast(this.scheme.name, 'sync', {
                    data: ourData,
                    timestamp: startTime,
                    lastSync: this.lastSyncTime
                });

                const requested = this.net.broadcast(this.scheme.name, 'sync-request', {
                    timestamp: startTime,
                    lastSync: this.lastSyncTime
                });

                this.lastSyncTime = startTime;
                this.dispatchEvent(new CustomEvent('sync', { detail: { sent, requested } }));
                
            } catch (error) {
                console.error('Synchronization failed:', error);
                throw error;
            }
        }

        async mergeRemoteData(remoteData) {
            if (!Array.isArray(remoteData)) {
                return { updates: 0, conflicts: 0 };
            }

            const conflicts = [];
            const updates = [];

            for (const remoteEntry of remoteData) {
                const key = remoteEntry[this.scheme.keyPath];
                const localEntry = await this.entries[key];

                if (!localEntry) {
                    updates.push([key, remoteEntry]);
                } else {
                    const resolved = ConflictResolver.resolveConflict(
                        localEntry, 
                        remoteEntry, 
                        this.syncStrategy
                    );

                    if (resolved !== localEntry) {
                        conflicts.push({ local: localEntry, remote: remoteEntry, resolved });
                        updates.push([key, resolved]);
                    }
                }
            }

            if (updates.length > 0) {
                await this.batchSet(updates);
            }

            return { updates: updates.length, conflicts: conflicts.length };
        }

        async destroy() {
            this.stopAutoSync();
            
            if (this.discoveryManager) {
                await this.discoveryManager.stopDiscovery();
            }
            
            if (this.peer) {
                await this.peer.destroy();
            }

            await super.close();
        }
    }

    /**
     * Main AuroraDB class with Universal Discovery
     */
    class AuroraDB extends EventTarget {
        constructor(scheme) {
            super();
            
            if (!scheme) {
                throw new Error('Database scheme is required');
            }

            this.scheme = this.validateAndNormalizeScheme(scheme);
            this.db = null;
            this.connected = false;
            this.isReady = false;
            
            if (typeof window !== 'undefined') {
                window.auroradb = this;
            }
        }

        validateAndNormalizeScheme(scheme) {
            const required = ['name'];
            for (const field of required) {
                if (!scheme[field]) {
                    throw new Error(`Missing required scheme field: ${field}`);
                }
            }

            const normalized = {
                version: 1,
                keyPath: 'id',
                indexes: [],
                distributed: false,
                p2pAdapter: 'peerjs',
                autoSync: true,
                syncInterval: 30000,
                syncStrategy: 'timestamp',
                ...scheme
            };

            if (typeof normalized.version !== 'number' || normalized.version < 1) {
                throw new Error('Version must be a positive number');
            }

            if (typeof normalized.name !== 'string' || normalized.name.length === 0) {
                throw new Error('Name must be a non-empty string');
            }

            return normalized;
        }

        static registerP2PAdapter(name, adapterClass) {
            p2pRegistry.register(name, adapterClass);
        }

        static listP2PAdapters() {
            return p2pRegistry.list();
        }

        async create(distributed = null, id = '') {
            try {
                const isDistributed = distributed !== null ? distributed : this.scheme.distributed;
                
                if (isDistributed) {
                    const config = {
                        ...this.scheme,
                        id: id || this.scheme.id
                    };
                    
                    console.log(`🚀 Creating distributed database with ${config.p2pAdapter} adapter`);
                    
                    const peerdb = new PeerStore(config);
                    
                    await new Promise((resolve, reject) => {
                        peerdb.addEventListener('open', resolve);
                        peerdb.addEventListener('error', reject);
                        setTimeout(() => reject(new Error('Database open timeout')), 25000);
                    });

                    // Setup sync channels
                    peerdb.net.channel(this.scheme.name, {
                        async get(_, answer) {
                            try {
                                const data = await peerdb.all();
                                answer('post', data);
                            } catch (error) {
                                console.error('Sync get failed:', error);
                            }
                        },
                        
                        async post(data) {
                            try {
                                const result = await peerdb.mergeRemoteData(data);
                                const postEvent = new CustomEvent('post', { 
                                    detail: { data, result } 
                                });
                                peerdb.dispatchEvent(postEvent);
                            } catch (error) {
                                console.error('Sync post failed:', error);
                            }
                        },

                        async sync(syncData) {
                            try {
                                if (syncData.data) {
                                    await peerdb.mergeRemoteData(syncData.data);
                                }
                            } catch (error) {
                                console.error('Sync failed:', error);
                            }
                        },

                        async 'sync-request'(requestData, answer) {
                            try {
                                const ourData = await peerdb.all();
                                const filteredData = requestData.lastSync 
                                    ? ourData.filter(entry => 
                                        (entry._timestamp || 0) > requestData.lastSync
                                      )
                                    : ourData;
                                    
                                answer('sync', { data: filteredData });
                            } catch (error) {
                                console.error('Sync request failed:', error);
                            }
                        }
                    });

                    this.db = peerdb;
                    this.connected = true;
                } else {
                    this.db = new IDBStore(this.scheme);
                    
                    await new Promise((resolve, reject) => {
                        this.db.addEventListener('open', resolve);
                        this.db.addEventListener('error', reject);
                        setTimeout(() => reject(new Error('Database open timeout')), 10000);
                    });
                }

                this.isReady = true;
                this.dispatchEvent(new CustomEvent('open'));
                
                console.log(`✅ AuroraDB "${this.scheme.name}" ready - ${isDistributed ? 'Distributed' : 'Local'} mode`);
                
                return this;
                
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Failed to create database: ${error.message}`);
            }
        }

        async destroy() {
            try {
                if (this.db && typeof this.db.destroy === 'function') {
                    await this.db.destroy();
                } else if (this.db && typeof this.db.close === 'function') {
                    await this.db.close();
                }

                return new Promise((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(`AuroraDB/${this.scheme.name}`);
                    
                    deleteReq.onsuccess = () => {
                        this.isReady = false;
                        this.connected = false;
                        this.db = null;
                        resolve();
                    };
                    
                    deleteReq.onerror = () => {
                        const error = new Error("Couldn't delete database");
                        this.dispatchEvent(new CustomEvent('error', { detail: error }));
                        reject(error);
                    };
                    
                    deleteReq.onblocked = () => {
                        const error = new Error("Database deletion blocked");
                        this.dispatchEvent(new CustomEvent('error', { detail: error }));
                        reject(error);
                    };
                });
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw error;
            }
        }

        checkReady() {
            if (!this.isReady || !this.db) {
                throw new Error('Database not ready. Call create() first.');
            }
        }

        // Core operations remain the same
        async add(key, data) {
            this.checkReady();
            
            if (key === undefined || key === null) {
                throw new Error('Key is required');
            }
            
            if (data === undefined || data === null) {
                throw new Error('Data is required');
            }

            try {
                const entry = typeof data === 'object' && data !== null 
                    ? { ...data, [this.scheme.keyPath]: key }
                    : { [this.scheme.keyPath]: key, value: data };
                    
                await (this.db.entries[key] = entry);
                return entry;
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Failed to add entry: ${error.message}`);
            }
        }

        async get(key) {
            this.checkReady();
            
            if (key === undefined || key === null) {
                throw new Error('Key is required');
            }

            try {
                return await this.db.entries[key];
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Failed to get entry: ${error.message}`);
            }
        }

        async remove(key) {
            this.checkReady();
            
            if (key === undefined || key === null) {
                throw new Error('Key is required');
            }

            try {
                const existed = await this.db.entries[key];
                if (existed) {
                    delete this.db.entries[key];
                    return true;
                }
                return false;
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Failed to remove entry: ${error.message}`);
            }
        }

        async filter(fn) {
            this.checkReady();
            return await this.db.filter(fn);
        }

        async every(fn) {
            this.checkReady();
            return await this.db.every(fn);
        }

        async slice(start, end) {
            this.checkReady();
            return await this.db.slice(start, end);
        }

        async all() {
            this.checkReady();
            return await this.db.all();
        }

        async count() {
            this.checkReady();
            return await this.db.count();
        }

        async clear() {
            this.checkReady();
            return await this.db.clear();
        }

        async transaction(fn) {
            this.checkReady();
            return await this.db.transaction(fn);
        }

        async post() {
            if (!this.connected) {
                throw new Error('Database is not distributed. Cannot post to peers.');
            }

            try {
                const entries = await this.all();
                const sent = this.db.net.broadcast(this.scheme.name, 'post', entries);
                return sent;
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Post operation failed: ${error.message}`);
            }
        }

        async fetch() {
            if (!this.connected) {
                throw new Error('Database is not distributed. Cannot fetch from peers.');
            }

            try {
                const requested = this.db.net.broadcast(this.scheme.name, 'get');
                return requested;
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Fetch operation failed: ${error.message}`);
            }
        }

        async sync() {
            if (!this.connected) {
                throw new Error('Database is not distributed. Cannot sync with peers.');
            }

            try {
                await this.db.sync();
            } catch (error) {
                this.dispatchEvent(new CustomEvent('error', { detail: error }));
                throw new Error(`Sync operation failed: ${error.message}`);
            }
        }

        // Utility methods
        isDistributed() {
            return this.connected;
        }

        getConnectionCount() {
            return this.connected ? this.db.net.getConnectionCount() : 0;
        }

        getPeerId() {
            return this.connected ? this.db.net.getPeerId() : null;
        }

        getP2PAdapter() {
            return this.connected ? this.db.net.getAdapter() : null;
        }

        getDiscoveryStats() {
            return this.connected ? this.db.net.getDiscoveryStats() : null;
        }

        getScheme() {
            return { ...this.scheme };
        }

        getStats() {
            return {
                name: this.scheme.name,
                isReady: this.isReady,
                isDistributed: this.connected,
                p2pAdapter: this.getP2PAdapter(),
                peerId: this.getPeerId(),
                connections: this.getConnectionCount(),
                discovery: this.getDiscoveryStats(),
                scheme: this.getScheme()
            };
        }
    }

    // Expose the P2P adapter registry and universal discovery for advanced users
    AuroraDB.P2PRegistry = p2pRegistry;
    AuroraDB.P2PAdapter = P2PAdapter;
    AuroraDB.UniversalDiscoveryManager = UniversalDiscoveryManager;
    AuroraDB.SecureDiscoveryLayer = SecureDiscoveryLayer;

    return AuroraDB;
})();

