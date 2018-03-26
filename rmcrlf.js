const fs = require('fs')
const Rx = require('rxjs/Rx')
const path = require('path')

const DIR_TO_DOIT = './sample'

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat({
          name: file,
          path: path.join(dir, file),
          absPath: path.join(__dirname, dir, file),
          size: fs.statSync(path.join(dir, file)).size,
        })
  })
  return filelist
}

console.log('Getting file list')
const flist = walkSync(DIR_TO_DOIT)

const read = (path, encoding = 'utf8') =>
  Rx.Observable.create(observer => {
    console.log('Reading :', path)
    fs.readFile(path, encoding, (err, data) => {
      if (err) return observer.error(err)
      observer.next({ data, path })
      observer.complete()
    })
  })

const sources = Rx.Observable.from(flist)
  .mergeMap(p => read(p.absPath, 'utf8'), 6)
  .subscribe(d => {
    console.log('Writing :', d.path)
    fs.writeFileSync(d.path, d.data.replace(/\r\n/g, '\n'))
  })
