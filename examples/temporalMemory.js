
function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}

nViz.settings({
  root:document.getElementById('svg'),
  cellSize: 18
})

var inputCells = []
for(var i = 0; i < 10; i++)
  inputCells[i] = {
    id:Math.random().toString(36).substring(7),
    color:'lightgray',
    activated: Math.random() > 0.8 ? true : false
  }

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
    permanences: sourcesPermanaces,
    permananceThreshold: 0.4
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
    if(Math.random() > 0.7){
      var segments = []
      var isPredicted = Math.random() > 0.95 ? true : false
      for(var s = 0; s < 2; s++){
        var targets = []
        for(var t = 0; t < 2; t++){
          var column = columns[randomInt(0,9)]
          var cell = column.cells[randomInt(0,9)]
          if(isPredicted){
            column.active = true
            cell.activated = true
          }
          targets[t] = {
            cell:cell,
            permanance:Math.random(),
            permananceThreshold: 0.4
          }
        }
        segments[s] = {
          source: columns[c].cells[i].id,
          targets: targets
        }
      }
      columns[c].cells[i].segments = segments
      if(isPredicted)
        columns[c].cells[i].predicted = true
    }
  }
}

nViz.render.spatialPooler({
  inputCells: inputCells,
  columns: columns,
  cellMargin: 1
})
