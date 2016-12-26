
var cells = []
for(var i = 0; i < 10; i++)
  cells[i] = {id:Math.random().toString(36).substring(7),color:'blue'}

var c = {
  id: 46934365,
  color: 'blue',
  size: 10,
  x: 50,
  y: 100
}

nViz.settings({root:document.getElementById('svg')})

nViz.render.column({
  cells: cells,
  cellSize: 8,
  cellMargin: 1
})

nViz.render.cell(c)
nViz.render.proximalDendrite({
  source: c,
  targets: cells.map(function(cell){
    return {cell:cell}
  }),
  opacity: 0.5
})
