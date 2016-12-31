##Documentation

nViz is a library of render functions. Most functions are composed of other functions - for example, a column function uses the cell function. Below is a breakdown of all the paramater objects that each render function requires.

####Settings

```
nViz.settings({
  root: document.getElementById('svg'),   // the default target svg element which the visualization will render
  cellSize: 18,                           // the default size for all cells
  cellMargin: 1                           // the default margin around each cell
})
```

####Cell

```
nViz.render.cell({
  id: '5wrkrq1oo5nal5scq5mi',    // every cell must have a unique id
  segments: [] ,                 // all the dendrite segments of the cell (see below for segment paramaters)
  color: 'blue'                  // optional - to override any infered cell colors
})
```

####Segment

```
nViz.render.segment({
  source: 'vjam0fjqdbnlq59oogvi',       // the source cell id (the cell that the dendrite belongs)
  targets: [
    {
      cell: 'co6iogrnd7zg7ko869a4i',    // the target cell id
      permanance: 0.54,                 // optional - the permanance value of the synaptic connection
      permananceThreshold: 0.4          // optional (required for permanance) - the threshold for giving the synapse transmittion
    }
  ]
})
```

####Spatial Pooler
```
nViz.render.spatialPooler({
  inputCells: [],                 // see above for cell paramaters
  columns: [
    {                             // column properties:
      active: true,               // indicating that the column is active
      bursting: true,             // indicating that the column is bursting
      cells: [],                  // all the cells in the column (see above for cell paramaters)
      sources: [],                // all the cells in the potential pool of the input space (see above for cell paramaters)
      permanances: [],            // the dendrite synaptic permanance values that map to the sources
      permananceThreshold: 0.4    // the permanance threshold for all permanances
    }
  ]
})
```
