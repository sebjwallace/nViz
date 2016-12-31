##Tutorial

####Cell

```
nViz.render.cell({
  id: '5wrkrq1oo5nal5scq5mi',    // every cell must have a unique id
  segments: [] ,                 // all the dendrite segments of the cell (see below for segment properties)
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
      permanance: 0.54,                 // the permanance value of the synaptic connection
      permananceThreshold: 0.4          // the threshold for giving the synapse transmittion
    }
  ]
})
```

####Spatial Pooler
```
nViz.render.spatialPooler({
  inputCells: [],                 // see above for cell properties
  columns: [
    {                             // column properties:
      active: true,               // indicating thar the column is active
      cells: [],                  // all the cells in the column (see above for cell properties)
      sources: [],                // all the cells in the potential pool of the input space
      permanances: [],            // the dendrite synaptic permanance values that map to the sources
      permananceThreshold: 0.4    // the permanance threshold for all permanances
    }
  ]
})
```
