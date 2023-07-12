/*
A chart is a billboard.js DOM element.
This module can handle multiple such charts.
Each chart gets it's own context, containing the state of all it's relevant configurations.

depends on: d3js v6, billboardjs v3


Some definitions:

            ^
        40  |    * S1         + S2           legend:
value   30  |           + S2
axis    20	|    + S2   * S1                  S1
        10  |                 * S1            S2
            |-----|-----|------|---------->
                  c1    c2     c3
                    category axis


- this example shows 2 series (S1 * downward trend, S2 + upward trend).
- each series has a key and a value - example: key=EU, value="European Union"
- the legend shows series keys, the tooltip the value.
                    

tooltip example when hovering over c2:

    c2
    ------------------------------
    seriesLabels[S1]  |  20 suffixText
    seriesLabels[S2]  |  30 suffixText





usage of function init:

cfg = {
	type: ,						// "line" or "bar" etc.
	chartDOMElementId: ,		// to which DOM elelement to attach the chart
	legendDOMElementId: ,		// to which DOM elelement to attach the legend; null means no legend
	// cols contain categories, Series (keys) and numerical values
	// cols data format example:
	// [
	//   ["c1", "c2", "c3"],
	// 	 ["S1", 40, 20, 10] 
	// 	 ["S2", 20, 30, 40] 
	// ]
	cols: ,
	seriesLabels: ,				// a Map(). key=series key, values are being displayed in the tooltips.
	suffixText: ,				// for display in tooltip
	isRotated: ,				// true makes it vertical and changes some visual details
	palette: ,					// array containing colors which are applied to currently selected series (by a simple algorithm: front to back - first entry, first color of palette, 2nd-2nd and so forth)
											// note: can be set only one time
	fixColors: ,				// a map, overriding palette colors mechanism by assigning colors for specified series entries
	alertMessage:				// an object implementing show() and hide(). a disappear timeout is expected.
}

*/

//import * as d3 from "./../../redist/
import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setChartInterface} from "./legend.mjs"
import {grid, gridCSS} from "./grid.mjs"
import {axis, axisCSS} from "./axis.mjs"
import {tooltip, tooltipCSS} from "./tooltip.mjs"		// the default one. can be overwritten w/ project specific impl'


// for all charts. refactor if neccessary that each chart gets their own CSS.
document.head.insertAdjacentHTML("beforeend", gridCSS()+axisCSS())


class Contexts {
	static states = new Map()		// each chart gets it's own state (aka "context")

	static add(context) {

		context.upsert = function(that) {
			Object.assign(this,that)		// keep, update from "that" or insert from "that"
			return this
		}

		context.applyColorsToSeries = function(cols) {	// see "usage of function init" palette & fixColors on what this is supposed to do
			this.colors = new Map()
			const currentlySelectedSeriesKeys = getSeriesKeys(cols)
			let idx = 0
			currentlySelectedSeriesKeys.forEach( (e) => {
				if(this.fixColors && this.fixColors[e]) {
					this.colors.set(e, this.fixColors[e])
				} else {
					if(this.palette) {
						this.colors.set(e, this.palette[idx++])
					} else {
						console.warn("chart: no palette and no fixed colors defined")
					}
				}
			})
		}
		this.states.set(context.id, context)
		return context
	}
	static has(id) { return this.states.has(id) }
	static get(id) { return this.states.get(id) }
}

function getSeries(cols) { return cols.slice(1) }		// col array w/o 1st entry (also an array) yields all series' keys+data (see also head comment)
function getSeriesKeys(cols) { return cols.map(e=>e[0]) }	// 1st element of every sub-array (in the array) yields all series' keys
function getCategories(cols) { return cols[0] }


export function init(cfg) {
	if(Contexts.has(cfg.chartDOMElementId)) {
		if(cfg.alertMessage) {
			cfg.alertMessage.hide()
		}
		updateChart(getSeries(cfg.cols),
				Contexts.get(cfg.chartDOMElementId).upsert({
					categories: getCategories(cfg.cols),
					suffixText: cfg.suffixText,
					seriesLabels: cfg.seriesLabels,
					fixColors: cfg.fixColors
				}),
				cfg.alertMessage
		)
	} else {
		connectLegend(
			updateChart(getSeries(cfg.cols),
				createChart(
					Contexts.add({
							id: cfg.chartDOMElementId,
							legendDOMElementId: cfg.legendDOMElementId,
							categories: getCategories(cfg.cols),
							// we need to hold all texts possible in the legend in order to let the chart pick the one it needs to display at runtime
							seriesLabels: cfg.seriesLabels,
							suffixText: cfg.suffixText,
							isRotated: cfg.isRotated,
							// a crook because of light-DOM to avoid problems w/ multiple charts
							uniquePrefix: "chartElement" + Math.floor(Math.random() * 10000),
							currentCols: [],
							onFinished: cfg.onFinished,
							palette: cfg.palette,
							fixColors: cfg.fixColors,
							alertMessage: cfg.alertMessage,
							showLines: typeof(cfg.showLines)!=="undefined"?cfg.showLines:true,
							tooltipFn: typeof(cfg.tooltipFn)!=="undefined"?cfg.tooltipFn:null,
							labelEveryTick: cfg.labelEveryTick
						}),
					cfg.type
				)
			)
		)

		if(cfg.alertMessage) {
			cfg.alertMessage.hide()
		}

		makeTooltipDismissable(cfg.chartDOMElementId)
	}
}

// -100 to +100
function shadeColor(color, percent) {
	if(!color) return "#000000"

	var R = parseInt(color.substring(1,3),16);
	var G = parseInt(color.substring(3,5),16);
	var B = parseInt(color.substring(5,7),16);

	R = parseInt(R * (100 + percent) / 100);
	G = parseInt(G * (100 + percent) / 100);
	B = parseInt(B * (100 + percent) / 100);

	R = (R<255)?R:255;  
	G = (G<255)?G:255;  
	B = (B<255)?B:255;  

	R = Math.round(R)
	G = Math.round(G)
	B = Math.round(B)

	var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
	var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
	var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

	return "#"+RR+GG+BB;
}

function createChart(context, type) {		// using billboard.js

	if(!context.tooltipFn) {
		document.head.insertAdjacentHTML("beforeend", tooltipCSS())
	}

	const cfg = {
		bindto: context.id,
		data: {
			columns: [],
			type: type,
			color: (x, d) => { 
				//console.log(x,d)
				//console.log(d, context.colors.get(d.id) )
				return shadeColor(context.colors.get(d.id), d.index===5?0:0)
			},
		},
		grid: grid(),
		axis: axis(context.categories, context.isRotated, context.id, context.labelEveryTick),
		tooltip: context.tooltipFn ? context.tooltipFn(context) : tooltip(context),
		onresized: function() {
			displayMissingDataInLegend(context.currentCols, context.uniquePrefix)
			if(context.onResized) {context.onResized()}
		},
		point: {pattern:[]},
		line: {classes:[]}
	}

	if(context.showLines) {
		cfg.line.classes.push("thick-line")
	} else {
		cfg.line.classes.push("hide-line")
		cfg.point.pattern.push("<circle r='6' cx='6' cy='6'></circle>")
	}

	if(context.legendDOMElementId) {
		cfg["legend"] = legend(context.legendDOMElementId, context.uniquePrefix)
		document.head.insertAdjacentHTML("beforeend", legendCSS(context.uniquePrefix))
	} else {
		cfg["legend"] = {
			show: false,
			hide: true,
		}
	}

	context.upsert({chart: bb.generate(cfg)})	// the billboard.js DOM element

	return context
}

function updateChart(cols, context, alertMessage) {
	context.applyColorsToSeries(cols)

	context.chart.load({
		//unload: getDiff(context.currentCols, cols), 	// smooth transition. sadly, doesn't correctly order legend. 
		unload: true, 									// unsmooth but order correctly
		columns: cols,
		categories: context.categories,
		done: function () {
			if(!displayMissingDataInLegend(cols, context.uniquePrefix)) {
				if(alertMessage) {
					alertMessage.show()		// expected to disappear without user-interaction after a timeout
				}
			}
			//addLegendKeyboardNavigability(chart.legendDOMElementId)
			if(context.onFinished) {context.onFinished()}
			drawScatterLines()
		}
	})

	context.upsert({currentCols: cols})

	context.chart.focus()	// avoid blurring when changing selection while something is focussed

	return context
}

// which of currentCols are not in newCols? returns array.
// its actually a set difference: currentCols - newCols
function getDiff(currentCols, newCols) {
	let retVal = []
	currentCols.forEach(e=> {
		if( newCols.filter(e2=>e2[0]==e[0]).length == 0 ) {
			retVal.push(e[0])
		}
	})
	return retVal
}

function connectLegend(context) {
	setChartInterface({
		focus: function(p) {context.chart.focus(p)}, 
		blur: function(p) {context.chart.defocus(p)},
		getTooltipText: function(p) {return context.seriesLabels.get(p)},
		getColor: function(key) {return context.colors.get(key)}
	})
}

function makeTooltipDismissable(chartDOMElementId) {
	document.addEventListener('click', (e) => {
		if(e.target.id != chartDOMElementId) {
			Contexts.get(chartDOMElementId).chart.tooltip.hide()
		}
	})
}

export function setYLabel(chartDOMElementId, text) {
	if(Contexts.get(chartDOMElementId)) {
		Contexts.get(chartDOMElementId).chart.axis.labels({ y: text })
	} else {
		console.debug("chart: no chart in DOM, can't set yLabel")
	}
}

export function resize(chartDOMElementId, w, h, callback) {
	if(Contexts.get(chartDOMElementId)) {
		if(callback) {
			Contexts.get(chartDOMElementId).upsert({onResized: callback})
		} else {
			Contexts.get(chartDOMElementId).upsert({onResized: null})
		}
		Contexts.get(chartDOMElementId).chart.resize({width: w, height: h})
	}
}

export function getUniqueId(chartDOMElementId) {
	if(Contexts.get(chartDOMElementId)) {
		return Contexts.get(chartDOMElementId).uniquePrefix
	} else {
		console.error("chart: id not found in contexts", chartDOMElementId)
		return ""
	}
}


/*
TODO: rewrite this original code as vanilla JS

green
document.querySelector("#chartCard-Migrant-population-share").shadowRoot.querySelector("#chart2 > svg > g > g.bb-chart > g.bb-chart-lines > g.bb-chart-line.bb-target.bb-target-NAT > g.bb-shapes.bb-shapes-NAT.bb-circles.bb-circles-NAT > use.bb-shape.bb-shape-21.bb-circle.bb-circle-21")

pink
document.querySelector("#chartCard-Migrant-population-share").shadowRoot.querySelector("#chart2 > svg > g > g.bb-chart > g.bb-chart-lines > g.bb-chart-line.bb-target.bb-target-EU-FOR > g.bb-shapes.bb-shapes-EU-FOR.bb-circles.bb-circles-EU-FOR > use.bb-shape.bb-shape-25.bb-circle.bb-circle-25")
*/
function drawScatterLines() {

	return

	$(".dotLine").remove();
	var svg
	var lineFunction = d3.line()
			.x(function (d) { return d.x; })
			.y(function (d) { return d.y; })

	for (var i = 0; i < data.length; i++) {
		console.log("D")

			var iterator = 0;
			var xSaved = 0;
			var circleCoords = [];
			var line = d3.line()
			var nodes = d3.selectAll(".bb-circle-" + i)
					.each(function (d) {

							var item = d3.select(this);
							var visible = displayed.indexOf(d.id) !== -1;

							if (d.value != null && d.value != 0 && visible) {
									var xPadding = window.innerWidth < 600 ? 3 : 7;
									var yPadding = window.innerWidth < 600 ? 3 : 7;
									var cx = $(this).attr('cx') ? $(this).attr('cx') : parseFloat($(this).attr('x')) + xPadding;

									var cy = $(this).attr('cy') ? $(this).attr('cy') : parseFloat($(this).attr('y')) + yPadding;
									circleCoords.push({ x: cx, y: cy });
							}
							if (indicators[currentCategory].removeZeroValue && d.value == 0) {
									this.remove();
							}
							if (d.id == "undefined") {
									this.remove();
							}
							iterator++;
					});

			svg = d3.selectAll("#chart svg .bb-chart-lines")

			var lineGraph = svg.append("path")
					.attr("d", lineFunction(circleCoords))
					.attr("class", "dotLine")
					.moveToBack();

	}

}

