const blessed = require('blessed'),
  contrib = require('blessed-contrib'),
  screen = blessed.screen()

screen.title = 'my window title'

var grid = new contrib.grid({ rows: 1, cols: 12, screen: screen })
var body = grid.set(0, 0, 1, 11, blessed.box, {
  keys: true,
  mouse: true,
  alwaysScroll: true,
  scrollable: true,
  valign:'bottom',
  scrollbar: {
    ch: ' ',
    bg: 'red',
  },
})
var box = grid.set(0, 11, 1, 1, blessed.box)
var inputBar = blessed.textbox({
  bottom: 0,
  left: 0,
  height: 1,
  width: '100%',
  keys: true,
  mouse: true,
  inputOnFocus: true,
  style: {
    fg: 'white',
    bg: 'blue', // Blue background so you see this is different from body
  },
})

// Add body to blessed screen
screen.append(inputBar)

// Close the example on Escape, Q, or Ctrl+C
screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0))

// Handle submitting data
inputBar.on('submit', text => {
  log(text)
  log(body.toString())
  inputBar.clearValue()
  inputBar.focus()
})

// Add text to body (replacement for console.log)
const log = text => {
  body.pushLine(text)
  screen.render()
}

/*
 * Demonstration purposes
 */

// Listen for enter key and focus input then
screen.key('enter', (ch, key) => {
  inputBar.focus()
})

// Log example output
setInterval(() => {
  log('----------------')
}, 1000)
