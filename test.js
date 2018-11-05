var app = new Vue({
  el: '#hexview',
  data: {
    selected: []
  }
})

var draw = SVG('drawing').size(1200, 1200)

function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
          callback(rawFile.responseText);
      }
  }
  rawFile.send(null);
}

function hex_coords(x_in, y_in) {
  let R = 50
  let r = Math.sqrt(3) / 2 * R
  let x = (2 * r) * x_in + r + (y_in % 2) * r
  let y = (1.5 * R) * y_in + R
  return [
      [Math.round(x + 0), Math.round(y + R)],
      [Math.round(x + r), Math.round(y + R/2)],
      [Math.round(x + r), Math.round(y - R/2)],
      [Math.round(x + 0), Math.round(y - R)],
      [Math.round(x - r), Math.round(y - R/2)],
      [Math.round(x - r), Math.round(y + R/2)],
  ]
}

let selected = null

//usage:
readTextFile("https://raw.githubusercontent.com/jholloc/hexmap/master/test.json", function(text) {
  var data = JSON.parse(text);
  let patterns = {}
  var n = 1
  for (let hex_name in data['hexes']) {
    let hex = data['hexes'][hex_name]
    let tokens = hex.image.split('/')
    let image = 'https://raw.githubusercontent.com/jholloc/hexmap/master/' + tokens[tokens.length - 1]
    if (!(image in patterns)) {
        patterns[image] = 'pattern' + n
        n += 1
        draw.defs().pattern(null, null).id(patterns[image]).width('100%').height('100%')
          .attr({ patternContentUnits: 'objectBoundingBox', patternUnits: null, x: null, y: null })
          .image(image, 1, 1)
    }
  }
  for (let hex_name in data['hexes']) {
    let hex = data['hexes'][hex_name]
    let coords = hex_coords(hex.q, hex.r)
    let tokens = hex.image.split('/')
    let image = 'https://raw.githubusercontent.com/jholloc/hexmap/master/' + tokens[tokens.length - 1]
    let pattern = patterns[image]
    console.log(pattern)
    let poly = draw.polygon(coords.join(' ')).fill('url(#' + pattern + ')').stroke('#999DA3')
    poly.click(() => {
      if (selected) {
        selected.selectize(false, {deepSelect: true})
      }
      let pattern = SVG.get(poly.node.attributes.fill.value)
      app.selected = [
        { label: 'hexid', value: poly.node.id, type: 'text' },
        { label: 'fill', value: pattern.node.children[0].href.baseVal, type: 'image' }
      ]
      poly.selectize({deepSelect: true})
      selected = poly
    })
    // .animate(10000).rotate(360).loop()
    // poly.selectize();

      // <polygon fill="url(#pattern1)" points="43,100 86,75 86,25 43,0 0,25 0,75" style="stroke: #999DA3;"/>
  }
});