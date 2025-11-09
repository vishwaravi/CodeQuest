import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.battleListeners = new Map(); // Store battle-specific listeners
  }

  // Initialize socket connection
  connect() {
    if (this.socket?.connected) {
      console.log('⚡ Socket already connected');
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
    return this.socket;
  }

  // Setup default event listeners
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('welcome', (data) => {
      console.log('👋 Welcome message:', data);
    });
  }

  // Battle-related methods
  
  // Join matchmaking queue
  joinQueue(userId, difficulty) {
    this.socket.emit('queue:join', { userId, difficulty });
  }

  // Leave matchmaking queue
  leaveQueue(userId) {
    this.socket.emit('queue:leave', { userId });
  }

  // Join battle room
  joinBattle(battleId, userId) {
    this.socket.emit('battle:join', { battleId, userId });
  }

  // Mark player as ready
  markReady(battleId, userId) {
    this.socket.emit('battle:ready', { battleId, userId });
  }

  // Send code change (deprecated - use sendCodeSync instead)
  sendCodeChange(battleId, userId, code) {
    this.socket.emit('battle:code-change', { battleId, userId, code });
  }

  // Send code sync with full code (debounced)
  sendCodeSync(battleId, userId, code, codeLength) {
    this.socket.emit('battle:code-sync', { battleId, userId, code, codeLength });
  }

  // Send language change
  sendLanguageChange(battleId, userId, language) {
    this.socket.emit('battle:language-change', { battleId, userId, language });
  }

  // Submit solution
  submitSolution(battleId, userId, code, result) {
    this.socket.emit('battle:submit', { battleId, userId, code, result });
  }

  // Leave battle
  leaveBattle(battleId, userId) {
    this.socket.emit('battle:leave', { battleId, userId });
  }

  // Execution events
  emitExecutionStart(battleId, userId) {
    this.socket.emit('execution:start', { battleId, userId });
  }

  emitExecutionComplete(battleId, userId, results) {
    this.socket.emit('execution:complete', { battleId, userId, results });
  }

  emitSubmissionComplete(battleId, userId, results, bothSubmitted, winner) {
    this.socket.emit('submission:complete', { battleId, userId, results, bothSubmitted, winner });
  }

  // Listen to execution events
  onOpponentExecutionStart(callback) {
    this.socket.on('opponent:execution-start', callback);
  }

  onOpponentExecutionComplete(callback) {
    this.socket.on('opponent:execution-complete', callback);
  }

  onOpponentSubmitted(callback) {
    this.socket.on('opponent:submitted', callback);
  }

  // Listen to battle events
  onQueueJoined(callback) {
    this.socket.on('queue:joined', callback);
  }

  onQueueLeft(callback) {
    this.socket.on('queue:left', callback);
  }

  onQueueError(callback) {
    this.socket.on('queue:error', callback);
  }

  onQueueStatus(callback) {
    this.socket.on('queue:status', callback);
  }

  onBattleMatched(callback) {
    this.socket.on('battle:matched', callback);
  }

  onBattleJoined(callback) {
    this.socket.on('battle:joined', callback);
  }

  onBattleError(callback) {
    this.socket.on('battle:error', callback);
  }

  onPlayerReady(callback) {
    this.socket.on('battle:player-ready', callback);
  }

  onCountdown(callback) {
    this.socket.on('battle:countdown', callback);
  }

  onBattleStart(callback) {
    this.socket.on('battle:start', callback);
  }

  onOpponentCodeChange(callback) {
    this.socket.on('battle:opponent-code-change', callback);
  }

  onOpponentCodeSync(callback) {
    this.socket.on('battle:opponent-code-sync', callback);
  }

  onLanguageChanged(callback) {
    this.socket.on('battle:language-changed', callback);
  }

  onPlayerSubmitted(callback) {
    this.socket.on('battle:player-submitted', callback);
  }

  onBattleCompleted(callback) {
    this.socket.on('battle:completed', callback);
  }

  onBattleCancelled(callback) {
    this.socket.on('battle:cancelled', callback);
  }

  onPlayerLeft(callback) {
    this.socket.on('battle:player-left', callback);
  }

  // Remove battle event listeners
  offBattleEvents() {
    const events = [
      'queue:joined',
      'queue:left',
      'queue:error',
      'queue:status',
      'battle:matched',
      'battle:joined',
      'battle:error',
      'battle:player-ready',
      'battle:countdown',
      'battle:start',
      'battle:opponent-code-change',
      'battle:opponent-code-sync',
      'battle:language-changed',
      'battle:player-submitted',
      'battle:completed',
      'battle:cancelled',
      'battle:player-left'
    ];

    events.forEach(event => {
      this.socket.off(event);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('🔌 Socket disconnected manually');
    }
  }

  // Emit event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected. Cannot emit:', event);
    }
  }

  // Listen to event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
