/*
A chart is a billboard.js DOM element.
This module can handle multiple such charts.
Each chart gets it's own context, containing the state of all it's relevant configurations.


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
	fixColors: ,				// a map, overriding palette colors mechanism by assigning colors for specified series entries
}

*/

import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setChartInterface} from "./legend.mjs"
import toastHtml from "./toast.mjs"
import {grid, axis} from "./rest.mjs"


let toast		// tasty but unhealthy


class Contexts {
	static states = new Map()		// each chart gets it's own state (aka "context")

	static add(context) {

		context.upsert = function(that) {
			Object.assign(this,that)
			return this
		}

		context.updateColors = function(cols) {	// see "usage of function init" palette & fixColors on what this is supposed to do
			this.colors = new Map()
			const currentlySelectedSeriesKeys = getSeriesKeys(cols)
			let idx = 0
			currentlySelectedSeriesKeys.forEach( (e) => {
				if(this.fixColors[e]) {
					this.colors.set(e, this.fixColors[e])
				} else {
					this.colors.set(e, this.palette[idx++])
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
		toast.hide()
		updateChart(getSeries(cfg.cols), Contexts.get(cfg.chartDOMElementId).upsert({
				categories: getCategories(cfg.cols),
				suffixText: cfg.suffixText,
				seriesLabels: cfg.seriesLabels
			})
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
							fixColors: cfg.fixColors
						}),
					cfg.type, getCategories(cfg.cols), cfg.cols
				)
			)
		)

		if(toast) {
			toast.hide()
		} else {
			toast = createToast(Contexts.get(cfg.chartDOMElementId).uniquePrefix)	// any uniquePrefix would do really; just take from 1st chart out of convenience
		}

		makeTooltipDismissable(cfg.chartDOMElementId)
	}
}


function createChart(context, type, categories, cols) {		// using billboard.js

	const cfg = {
		bindto: "#"+context.id,
		data: {
			columns: [],
			type: type,
			color: (_, d) => { return context.colors.get(d.id) },
		},
		grid: grid(),
		axis: axis(categories, context.isRotated),
		tooltip: {
			show: true,
			// this takes care of disappearing when clicking inside the chart.
			// disappearing by clicking anywhere else is up to the user of this component.
			doNotHide: false,
			format: {
				name: function (name, ratio, id, index) { return context.seriesLabels.get(id) },
				value: function (value, ratio, id, index) { return Number(value).toFixed(1) + context.suffixText }
			}
		},
		onresized: function() {
			displayMissingDataInLegend(context.currentCols, context.uniquePrefix)
		}
	
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

export function updateChart(cols, context) {
	context.updateColors(cols)

	context.chart.load({
		// unload: getDiff(context.currentCols, cols), 	// smooth transition. sadly, doesn't correctly order legend. 
		unload: true, 									// unsmooth but order correctly
		columns: cols,
		categories: context.categories,
		done: function () {
			if(!displayMissingDataInLegend(cols, context.uniquePrefix)) {
				toast.show()	// disappears by itself
			}
			//addLegendKeyboardNavigability(chart.legendDOMElementId)
			context.onFinished()
		}
	})

	context.upsert({currentCols: cols})

	context.chart.focus()	// avoid blurring when changing selection while something is focussed

	return context
}

export function setYLabel(chartDOMElementId, text) {
	Contexts.get(chartDOMElementId).chart.axis.labels({ y: text })
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

function createToast(uniquePrefix) {
	document.body.insertAdjacentHTML("beforeend", toastHtml(uniquePrefix + "toast"))
	return new bootstrap.Toast(document.getElementById(uniquePrefix + "toast"))
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
