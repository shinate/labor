import './style.less'

const box = $('<div class="container"></div>')
box.appendTo($(document.body))

box.on('mousedown', (e) => {
  e.preventDefault()
  const { pageX: x, pageY: y } = e
  $(`<div class="point" style="transform: translate3d(${x}px, ${y}px, 0)"></div>`).appendTo(box)
})
// box.on('mousemove', (e) => {
//   e.preventDefault()
// })
// box.on('mouseup', (e) => {
//   e.preventDefault()
// })
