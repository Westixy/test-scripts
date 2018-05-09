const uuidv4 = require('uuid/v4')
const Emitter = require('events')
const debug = require('debug')

const netProxyEmul = new Emitter()

class NetClientProxy {
  constructor() {
    this.ev = new Emitter()
    this._log = debug('netProxy:client')
    this._initEvents()
  }
  _initEvents() {
    this.ev.on('error', err => this._log('Error :', err))
    this.ev.on('connect', () => this._log('connect'))
    this.ev.on('connected', socket => this._log('connected:', socket))
    this.ev.on('disconnect', () => this._log('disconnected'))
    this.ev.on('destroy', () => this._log('destroyed'))
    this.ev.on('data', data => this._log('data:', data.toString()))
    this.ev.on('data:object', data => this._log('obj:', data))
  }
  get socket() {
    return null
  }
  connect(ip, port) {
    this.ev.emit('connect')
    this.ev.emit('connected', `${uuidv4()}@${ip}:${port}`)
  }
  disconnect() {
    this.ev.emit('disconnect')
  }
  send(data) {
    this._log('Send :', data)
  }
}

class NetClientProxyEmitter extends NetClientProxy {
  constructor() {
    super()
    this._socket = null
    this._address = uuidv4()
    this._initEvents()
  }
  _initEvents() {
    this.ev.on('error', err => this._log('Error :', err))
    this.ev.on('connect', () => this._log('connect'))
    this.ev.on('connected', socket => this._log('connected:', socket))
    this.ev.on('disconnect', () => this._log('disconnected'))
    this.ev.on('destroy', () => this._log('destroyed'))
    this.ev.on('data', data => this._log('data:', data.toString()))
    this.ev.on('data:object', data => this._log('obj:', data))
  }
  get socket() {
    return this._socket
  }
  connect(ip, port) {
    netProxyEmul.emit(`net.${port}`,this._address)
    setTimeout(()=>{

    },1000)
    netProxyEmul.once(`net.${port}.connected`,()=>{})
  }
  disconnect() {
  }
  send(data) {
  }
}

class NetServerProxy {
  constructor() {
    this.ev = new Emitter()
    this._log = debug('netProxy:server')
    this._initEvents()
  }
  _initEvents() {
    this.ev.on('error', err => this._log('Error :', err))
    this.ev.on('start', () => this._log('start listening'))
    this.ev.on('stop', () => this._log('stop listening'))
    this.ev.on('socket.connect', socket => this._log('s.connect:', socket))
    this.ev.on('socket.disconnect', socket => this._log('s.diconnect:', socket))
    this.ev.on('data', (socket, data) => this._log('data:', socket, data))
    this.ev.on('data:object', (socket, data) => this._log('obj:', socket, data))
  }
  listen(port) {
    this.ev.emit('start')
  }
  stop() {
    this.ev.emit('stop')
  }
  send(data) {
    this._log('Send:', data)
  }
}

class ClientStorage {
  constructor({
    uuid = uuidv4(),
    session = {},
    socket = new Emitter(),
    uids = {
      receive: null,
      send: null,
    },
    storage = {
      recieve: [],
      send: [],
    },
  } = {}) {
    Object.assign(this, {
      uuid,
      session,
      socket,
      uids,
      storage,
    })
    if (this.socket.listenerCount('m') === 0) this.socket.on('m', this.onData)
  }

  onData(data) {
    console.log(this.uuid.sub(0, 4), 'recieved :', data)
  }
}

console.log(new ClientStorage())
