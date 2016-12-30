
function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}

nViz.settings({
  root:document.getElementById('svg'),
  cellSize: 18
})

var inputCells = []
for(var i = 0; i < 10; i++)
  inputCells[i] = {id:Math.random().toString(36).substring(7),color:'gray'}

var columns = []
for(var x = 0; x < 10; x++){
  var sourceCells = []
  var sourcesPermanaces = []
  for(var i = 0; i < inputCells.length; i++){
    if(Math.random() > 0.5){
      sourceCells.push(inputCells[i])
      sourcesPermanaces[sourceCells.length-1] = Math.random()
    }
  }
  columns[x] = {
    cells: [],
    sources: sourceCells,
  }
  for(var i = 0; i < 10; i++){
    var id = Math.random().toString(36).substring(7)
    var segments = []
    columns[x].cells[i] = {
      id:id,
      color:'lightgray',
      segments: segments
    }
  }
}

for(var c in columns){
  for(var i in columns[c].cells){
    var segments = []
    for(var s = 0; s < 2; s++){
      var targets = []
      for(var t = 0; t < 2; t++){
        var cell = columns[randomInt(0,9)].cells[randomInt(0,9)]
        targets[t] = {cell:cell}
      }
      segments[s] = {
        source: columns[c].cells[i].id,
        targets: targets
      }
    }
    if(Math.random() > 0.7)
      columns[c].cells[i].segments = segments
  }
}

// columns[1].cells[5].activated = true
// columns[4].cells[2].predicted = true

nViz.render.spatialPooler({
  inputCells: inputCells,
  columns: columns,
  cellMargin: 1
})
