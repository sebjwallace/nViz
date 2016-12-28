
nViz.settings({
  root:document.getElementById('svg')
})

var inputCells = []
for(var i = 0; i < 10; i++)
  inputCells[i] = {id:Math.random().toString(36).substring(7),color:'blue'}

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
    sourcesPermanaces: sourcesPermanaces,
    permananceThreshold: 0.4
  }
  for(var i = 0; i < 10; i++)
    columns[x].cells[i] = {id:Math.random().toString(36).substring(7),color:'blue'}
}

nViz.render.spatialPooler({
  inputCells: inputCells,
  columns: columns,
  cellSize: 8,
  cellMargin: 1
})
