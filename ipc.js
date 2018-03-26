const ipc = require('node-ipc')
ipc.config.silent = true
const dport = 52007

class Srv {
  constructor() {
    this.clis = []
  }
  start(port = dport) {
    ipc.serveNet('0.0.0.0', port, sock => {})
    this.initEvents()
    this.srv.start()
  }
  initEvents() {
    const srv = (this.srv = ipc.server)

    srv.on('::DEBUG', (data, sock) => console.log(data))
    srv.on('::DEBUG::EVAL', (data, sock) => console.log(eval(data)))
    srv.on('connect', sock => {
      //console.log('connected', this.clis)
      this.clis.push({ sock })
    })
    srv.on('socket.disconnected', sock => {
      const { client, index } = this.get(sock)
      this.clis.splice(index, 1)
      //console.log('disconnected', client, this.clis.length)
    })
    srv.on('error', console.error)
    srv.on('::register', (data, sock) => {
      const gname = this.getFromName(data)
      if (gname !== null) return srv.emit(sock, '::register.exist', data)

      const { client, index } = this.get(sock)
      client.name = data
      srv.emit(sock, '::register.ok', data)
      //console.log('register', client)
    })
  }
  on(name, action) {
    ipc.server.on(name, (data, sock) => {
      action(data, this.get(sock))
    })
  }
  stop() {
    ipc.server.stop()
  }
  get(sock) {
    const index = this.clis.map(c => c.sock).indexOf(sock)
    return { client: this.clis[index], index }
  }
  getFromName(name) {
    const index = this.clis.map(c => c.name).indexOf(name)
    if (index === -1) return null
    return { client: this.clis[index], index }
  }
}

class ServerChannel extends Srv {
  constructor() {
    super()
  }

  initEvents() {
    super.initEvents()
    this.srv.on('::channel.emit', (data, sock) => {
      this.emitChannel(data.chan, data.event, data.data)
    })
    this.srv.on('::channel.register', (data, sock) => {
      const { client } = this.get(sock)
      if (client.channels === undefined) client.channels = []
      if (client.channels.includes(data) !== true) client.channels.push(data)
    })
    this.srv.on('::channel.unregister', (data, sock) => {
      const { client } = this.get(sock)
      const index = client.channels.indexOf(data)
      if (index !== -1) client.channels.splice(index)
    })
  }

  listChans() {
    return Object.keys(this.channels)
  }

  get channels() {
    const channels = {}
    this.clis.forEach(cli => {
      cli.channels.forEach(chan => {
        if (channels[chan] === undefined) channels[chan] = []
        channels[chan].push(cli)
      })
    })
    return channels
  }

  emitChannel(chan, ev, data) {
    this.channels[chan].forEach(cli => {
      this.srv.emit(cli.sock, ev, data)
    })
  }
}

let u = 0

class Cli {
  constructor() {
    this.uid = '_' + u++
  }
  connect({ host = '127.0.0.1', port = dport, name = 'client' } = {}) {
    return new Promise((res, rej) => {
      ipc.connectToNet(this.uid, '127.0.0.1', dport, () => {
        const cli = ipc.of[this.uid]
        cli.on('::DEBUG', data => console.log(data))
        cli.on('::DEBUG::EVAL', data => console.log(eval(data)))
        cli.on('error', rej)
        cli.on('::register.ok', data => {
          this.name = data
          res(cli)
        })
        cli.on('connect', () => {
          // console.log('connect')
          cli.emit('::register', name)
        })
        cli.on('disconnect', () => {
          // console.log('disconnect')
        })
        cli.on('::register.exist', data => {
          cli.emit('::register', data + '_')
        })
        this.initEvents(cli)
      })
    })
  }
  initEvents(cli) {}
  disconnect() {
    ipc.of[this.uid].disconnect()
  }
  on(name, action) {
    ipc.of[this.uid].on(name, action)
  }
  emit(name, action) {
    ipc.of[this.uid].emit(name, action)
  }
  dbglog(data) {
    ipc.of[this.uid].emit('::DEBUG', data)
  }
  dbgeval(data) {
    ipc.of[this.uid].emit('::DEBUG::EVAL', data)
  }
}

class ClientChannel extends Cli {
  constructor() {
    super()
    this._chans = []
  }
  connect(opt) {
    this._chans = opt.chans || []
    return super.connect(opt)
  }

  initEvents(cli) {
    super.initEvents(cli)
    cli.on('connect', () => {
      this._chans.forEach(chan => this.registerChannel(chan))
    })
  }
  emitChannel(chan, event, data) {
    this.emit('::channel.emit', { chan, event, data })
  }
  registerChannel(chan) {
    this.emit('::channel.register', chan)
    if (this._chans.includes(chan) !== true) this._chans.push(chan)
  }
  unregisterChanel(chan) {
    const index = this._chans.indexOf(chan)
    if (index !== -1) {
      this.emit('::channel.unregister', chan)
      this._chans.splice(index, 1)
    }
  }
}

module.exports = {
  Client: ClientChannel,
  Server: ServerChannel,
}
