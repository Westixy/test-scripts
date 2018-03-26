const { Server } = require('./ipc')

const S = new Server()

S.start()
S.srv.on('connect', sock => S.srv.emit(sock, '::DEBUG', 'console.log(this)'))
