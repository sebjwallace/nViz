
function nViz(){

  var events = new EventsHandler()

  var settings = {
    root: document.querySelector('svg'),
    cellSize: 10
  }

  var cellIndex = {}
  function indexCell(cell,x,y){
    cellIndex[cell.id] = {
      cell: cell,
      x: x || 0,
      y: y || 0
    }
  }
  function getCell(cell){
    if(typeof cell == 'string')
      return cellIndex[cell].cell
    else if(cell.id)
      return cellIndex[cell.id].cell
  }

  function createNode(type){
    return document.createElementNS('http://www.w3.org/2000/svg',type)
  }

  function setAttributes(node,attrs){
    for(var i in attrs){
      if(i == 'events')
        for(var e in attrs.events)
          node[e] = attrs.events[e]
      else if(i == 'data')
        for(var d in attrs.data)
          node.setAttribute('data-'+d,attrs.data[d])
      else if(i == 'attrs')
        for(var a in attrs.attrs)
          node.setAttribute(a,attrs.attrs[a])
      else node.setAttribute(i,attrs[i])
    }
  }

  function normalizeArgs(args){
    if((args.source && !args.x) && (args.source && !args.y)){
      var source = getCell(args.source)
      args.sourceX = source.x
      args.sourceY = source.y
    }
    if((args.target && !args.x) && (args.target && !args.y)){
      var target = getCell(args.target)
      args.targetX = target.x
      args.targetY = target.y
    }
    return args
  }

  return {

    settings: function(args){
      cellIndex = {}
      for(var i in args)
        settings[i] = args[i]
    },

    clear: function(root){
      (root || settings.root).innerHTML = ''
    },

    render: {

      cell: function(args){
        args = normalizeArgs(args)
        var size = args.size || settings.size
        var cell = createNode('circle')
        var color = args.color || 'black'
        color = args.inActiveColumn ? 'rgb(210,210,140)' : color
        color = args.activated ? 'yellow' : color
        color = args.predicted ? 'orange' : color
        var attrs = {
          id: args.id,
          class: 'nViz-cell ' + (args.class || ''),
          data: args.data,
          height: size,
          width: size,
          r: size / 2,
          fill: color,
          x: args.x || 0, cx: (args.x + (size * 0.5)) || 0,
          y: args.y || 0, cy: (args.y + (size * 0.5)) || 0,
          events: args.events
        }
        setAttributes(cell,attrs)
        indexCell(attrs)
        settings.root.appendChild(cell)
        return cell
      },

      dendrite: function(args){
        args = normalizeArgs(args)
        var body = createNode('circle')
        var size = args.headSize || args.size || 2
        if(!args.hideHead){
          setAttributes(body,{
            r: args.headSize || size,
            cx: args.sourceX,
            cy: args.sourceY,
            fill: args.color || 'black',
            opacity: args.opacity || 1,
            class: args.class,
            events: args.events,
            data: args.data,
            attrs: { 'fill-opacity': args.attrs['stroke-opacity'] * 2 }
          })
          settings.root.appendChild(body)
        }
        var cellSize = args.cellSize || settings.cellSize
        var centered = args.noAlignment ? 0 : (cellSize * 0.5)
        var direction = Math.atan2(args.targetY-args.sourceY,args.targetX-args.sourceX)
        var dendrite = createNode('path')
        var sX = args.sourceX
        var sY = args.sourceY
        var tX = args.targetX + centered - (Math.cos(direction) * centered)
        var tY = args.targetY + centered - (Math.sin(direction) * centered)
        var angle = Math.atan2(tY-sY,tX-sX)
        var path = 'M'+sX+' '+sY+' L'+tX+' '+tY+' '
        if(!args.hideTail)
          path += 'M'+sX+' '+sY+' L'+tX+' '+tY
              +' L'+((tX) + Math.cos(angle-45) * 5)+' '+((tY) + Math.sin(angle-45) * 5)
              +' L'+(tX)+' '+(tY)
              +' L'+((tX) + Math.cos(angle+45) * 5)+' '+((tY) + Math.sin(angle+45) * 5)
              +' L'+(tX)+' '+(tY)
        setAttributes(dendrite,{
          class: 'nViz-dendrite ' + (args.class || ''),
          data: args.data,
          attrs: args.attrs,
          stroke : args.color || 'black',
          fill: 'none',
          opacity: (args.opacity || 1) * (args.weight || 1),
          d: path + ' Z',
          style: 'pointer-events: none'
        })
        settings.root.appendChild(dendrite)
        return dendrite
      },

      segment: function(args){
        args = normalizeArgs(args)
        for(var i = 0; i < args.targets.length; i++){
          var target = args.targets[i]
          var dendriteOpacity = target.permanance > target.permananceThreshold ? 0.2 : 0.08
          args.attrs['stroke-opacity'] = dendriteOpacity
          nViz.render.dendrite({
            headSize: 1,
            sourceX: args.sourceX,
            sourceY: args.sourceY,
            target: args.targets[i].cell,
            stroke: args.color || 'black',
            opacity: (args.opacity || 1) * (args.targets[i].weight || 1),
            cellSize: args.cellSize,
            class: args.class,
            events: args.events,
            data: args.data,
            attrs: args.attrs
          })
        }
      },

      proximalDendrite: function(args){
        args = normalizeArgs(args)
        var arrX = args.targets.map(function(v)
          {return getCell(v.cell).x})
        var arrY = args.targets.map(function(v)
          {return getCell(v.cell).y})
        var maxX = Math.max.apply(null,arrX)
        var minX = Math.min.apply(null,arrX)
        var maxY = Math.max.apply(null,arrY)
        var minY = Math.min.apply(null,arrY)
        var deltaX = args.sourceX - minX
        var deltaY = args.sourceY - minY
        var x = minX + ((maxX - minX) / 2) + (deltaX * 0.25)
        var y = minY + ((maxY - minY) / 2) + (deltaY * 0.25)
        var dendrite = nViz.render.dendrite({
          hideTail: true,
          noAlignment: true,
          sourceX: args.sourceX + (getCell(args.source).width / 2),
          sourceY: args.sourceY + (getCell(args.source).height / 2),
          targetX: x,
          targetY: y,
          opacity: args.opacity,
          class: args.class,
          events: args.events,
          data: args.data,
          attrs: args.attrs
        })
        var segment = nViz.render.segment({
          sourceX: x,
          sourceY: y,
          targets: args.targets,
          opacity: args.opacity,
          class: args.class,
          events: args.events,
          data: args.data,
          attrs: args.attrs
        })
      },

      distalDendrite: function(args){
        var dendrites = []
        for(var i = 0; i < args.targets.length; i++){
          if(args.permanences)
            var opacity = args.permanences[i] > args.permananceThreshold ? 0.2 : 0.08
          else var opacity = (args.opacity || 0.4) * (args.targets[i].weight || 0.4)
          var dendrite = nViz.render.dendrite({
            sourceX: getCell(args.source).x + (args.sourceOffsetX || args.offsetX || 0),
            sourceY: getCell(args.source).y + (args.sourceOffsetY || args.offsetY || 0),
            targetX: getCell(args.targets[i]).x + (args.targetOffsetX || args.offsetX || 0),
            targetY: getCell(args.targets[i]).y + (args.targetOffsetY || args.offsetY || 0),
            opacity: args.opacity || 1,
            class: 'nViz-distal-dendrite ' + (args.class || ''),
            data: args.data,
            attrs: { 'stroke-opacity': opacity }
          })
          dendrites.push(dendrite)
        }
        return dendrites
      },

      layer: function(args){
        for(var i = 0; i < args.cells.length; i++){
          var cell = {
            id: args.cells[i].id,
            x: i * (args.cellSize + args.cellMargin),
            y: args.offset || 0,
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            activated: args.cells[i].activated,
            predicted: args.cells[i].predicted
          }
          nViz.render.cell(cell)
        }
      },

      column: function(args){
        var cells = []
        for(var i = 0; i < args.cells.length; i++){
          var attrs = {
            id: args.cells[i].id,
            class: (args.class || '') + ' nViz-cell-' + i,
            x: args.offsetX || 0,
            y: i * (args.cellSize + args.cellMargin) + (args.offsetY || 0),
            size: args.cellSize || args.cells[i].size,
            color: args.color || args.cells[i].color,
            inActiveColumn: args.active ? true : false,
            events: args.events,
            data: args.data
          }
          for(var c in args.cells[i])
            attrs[c] = args.cells[i][c]
          var cell = nViz.render.cell(attrs)
          cells.push(cell)
        }
        return cells
      },

      spatialPooler: function(args){
        var cellSize = args.cellSize || settings.cellSize
        var inputSpace = nViz.render.layer({
          cells: args.inputCells,
          cellSize: cellSize,
          cellMargin: args.cellMargin || 1
        })
        var columns = nViz.render.temporalMemory({
          columns: args.columns,
          offsetY: (cellSize) * 10
        })
        for(var i = 0; i < args.columns.length; i++){
          var className = 'nViz-column'
          var distalDendrite = nViz.render.distalDendrite({
            source: args.columns[i].cells[0],
            targets: args.columns[i].sources,
            sourceOffsetX: cellSize * 0.5,
            permananceThreshold: args.columns[i].permananceThreshold,
            permanences: args.columns[i].permanences,
            data: {columnIndex: i}
          })
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnIndex') != e.target.getAttribute('data-columnIndex'))
                fadeOut[c].setAttribute('opacity',0.01)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var cells = document.getElementsByClassName('nViz-distal-dendrite')
            for(var c = 0; c < cells.length; c++)
              cells[c].setAttribute('opacity',1)
          })
        }
      },

      temporalMemory: function(args){
        var cellSize = args.cellSize || settings.cellSize
        for(var i = 0; i < args.columns.length; i++){
          var className = 'nViz-column'
          var column = nViz.render.column({
            class: className + ' nViz-column-' + i,
            cells: args.columns[i].cells,
            cellSize: cellSize,
            cellMargin: args.cellMargin || 1,
            offsetX: (cellSize + (args.cellMargin || 1)) * i,
            offsetY: args.offsetY,
            active: args.columns[i].active,
            events: {
              onmouseenter: function(e){ events.triggerEvent(className,e) },
              onmouseleave: function(e){ events.triggerEvent('recoverColumnVisibility',e) }
            },
            data: {columnIndex: i}
          })
          events.addEvent(className, function(e){
            var fadeOut = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < fadeOut.length; c++)
              if(fadeOut[c].getAttribute('data-columnIndex') != e.target.getAttribute('data-columnIndex'))
                fadeOut[c].setAttribute('opacity',0)
          })
          events.addEvent('recoverColumnVisibility', function(e){
            var fadeIn = document.getElementsByClassName('nViz-column')
            for(var c = 0; c < fadeIn.length; c++)
              fadeIn[c].setAttribute('opacity',1)
          })
        }
        for(var c = 0; c < args.columns.length; c++){
          for(var i = 0; i < args.columns[c].cells.length; i++){
            for(var s = 0; s < args.columns[c].cells[i].segments.length; s++){
              var segment = {
                class: 'nViz-column',
                attrs: {'stroke-opacity': 0.2},
                data: { columnIndex: c },
                cellSize: cellSize,
                opacity: args.columns[c].cells[i].predicted ? 1 : 0.01
              }
              for(var a in args.columns[c].cells[i].segments[s])
                segment[a] = args.columns[c].cells[i].segments[s][a]
              nViz.render.proximalDendrite(segment)
            }
          }
        }
      },

      sdr: function(args){
        var bitIndex = {}
        for(var i = 0; i < args.activeBits.length; i++)
          bitIndex[args.activeBits[i]] = true
        var sqrt = Math.sqrt(args.nBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var color = bitIndex[(y*sqrt)+x] ? (args.activeColor || 'black')
              : (args.inactiveColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            var cellSize = args.size || settings.cellSize
            setAttributes(bit,{
              height: cellSize,
              width: cellSize,
              fill: color,
              x: (cellSize + 1) * x,
              y: (cellSize + 1) * y
            })
            settings.root.appendChild(bit)
          }
        }
      },

      sdrOR: function(args){
        var bitIndex = {}
        for(var x = 0; x < args.sdrs.length; x++)
          for(var y = 0; y < args.sdrs[x].length; y++)
            bitIndex[args.sdrs[x][y]] = true
        var sqrt = Math.sqrt(args.nBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var color = bitIndex[(y*sqrt)+x] ? (args.activeColor || 'black')
              : (args.inactiveColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            setAttributes(bit,{
              height: args.size || 8,
              width: args.size || 8,
              fill: color,
              x: ((args.size || 8) + 1) * x,
              y: ((args.size || 8) + 1) * y
            })
            settings.root.appendChild(bit)
          }
        }
      },

      sdrAND: function(args){
        var bitIndex = {}
        for(var x = 0; x < args.sdrs.length; x++)
          for(var y = 0; y < args.sdrs[x].length; y++)
            bitIndex[args.sdrs[x][y]] = bitIndex[args.sdrs[x][y]]+1 || 1
        var sqrt = Math.sqrt(args.nBits)
        for(var y = 0; y < sqrt; y++){
          for(var x = 0; x < sqrt; x++){
            var color = bitIndex[(y*sqrt)+x] == args.sdrs.length ?
              (args.activeColor || 'black')
              : (args.inactiveColor || 'rgba(0,0,0,0.2)')
            var bit = createNode('rect')
            setAttributes(bit,{
              height: args.size || 8,
              width: args.size || 8,
              fill: color,
              x: ((args.size || 8) + 1) * x,
              y: ((args.size || 8) + 1) * y
            })
            settings.root.appendChild(bit)
          }
        }
      }

    }

  }

}

nViz = nViz()
