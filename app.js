let hexjs = (function() {

    let draw = SVG('drawing').viewbox(-10, -10, 930, 790).panZoom({zoomMin: 0.1, zoomMax: 10});

    let app = new Vue({
        el: '#hexmap',
        data: {
            num_hexes: 0,
            hexes: [],
            selected: null,
            patterns: {},
            showImagePicker: false,
            images: [],
        },
        methods: {
            imageClicked: function(evt) {
                console.log(evt.srcElement.id);
                this.showImagePicker = true;
            },
            imageSelected: function(evt) {
                let el = findAncestor(evt.srcElement, 'hex-selected');
                let id = el.firstChild.innerHTML.trim();
                console.log(id);
                let node = SVG.get(id);
                node.fill(evt.srcElement.src)
                this.showImagePicker = false;
                this.selected.image = evt.srcElement.src;
            },
            resetZoom: function(evt) {
                this.zoom(1)
            }
        }
    })

    function findAncestor(el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }

    function readTextFile(file, callback) {
        let rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }

    function hexCoords(x_in, y_in) {
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

    function addSVGPatterns(hexes) {
        var n = 1
        for (let hex_name in hexes) {
            let hex = hexes[hex_name]
            let tokens = hex.image.split('/')
            let image = 'https://raw.githubusercontent.com/jholloc/hexmap/master/' + tokens[tokens.length - 1]
            if (!(image in app.patterns)) {
                app.patterns[image] = 'pattern' + n
                n += 1
                draw.defs().pattern(null, null).id(app.patterns[image]).width('100%').height('100%')
                    .attr({ patternContentUnits: 'objectBoundingBox', patternUnits: null, x: null, y: null })
                    .image(image, 1, 1)
                app.images.push(image);
            }
        }
    }

    function addSVGPolygons(hexes) {
        for (let hex_name in hexes) {
            let hex = hexes[hex_name]
            let coords = hexCoords(hex.q, hex.r)
            let tokens = hex.image.split('/')
            let image = 'https://raw.githubusercontent.com/jholloc/hexmap/master/' + tokens[tokens.length - 1]
            //let pattern = app.patterns[image]
            //let poly = draw.polygon(coords.join(' ')).fill('url(#' + pattern + ')').stroke('#999DA3')
            let poly = draw.polygon(coords.join(' ')).fill(image).stroke('#999DA3')
            poly.click(() => {
                app.showImagePicker = false;
                if (app.selected) {
                    app.selected.selectize(false, {deepSelect: true})
                }
                let pattern = SVG.get(poly.node.attributes.fill.value)
                app.selected = poly;
                app.selected.image = pattern.node.children[0].href.baseVal;
                poly.selectize({deepSelect: true})
            })
        }
    }

    function onLoaded(text) {
        var data = JSON.parse(text);
        app.hexes = data['hexes'];
        app.num_hexes = Object.keys(app.hexes).length;
        addSVGPatterns(app.hexes);
        addSVGPolygons(app.hexes);
    }

    return {
        load: function() {
            readTextFile("https://raw.githubusercontent.com/jholloc/hexmap/master/test.json", onLoaded);
        }
    };

})();

hexjs.load();