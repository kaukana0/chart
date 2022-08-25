/*
some definitions:

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
    seriesLabels[S1]  |  20 suffix
    seriesLabels[S2]  |  30 suffix





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
	isRotated: 					// true makes it vertical and changes some visual details
}

*/

import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setChartInterface} from "./legend.mjs"
import toastHtml from "./toast.mjs"
import {grid, axis} from "./rest.mjs"


let toast		// tasty but unhealthy


class States {
	static states = new Map()

	static add(chartDOMElementId, legendDOMElementId, categories, tooltipTexts, suffixText, isRotated) {
		this.states.set(chartDOMElementId, {
			id: chartDOMElementId,
			legendDOMElementId: legendDOMElementId,
			categories: categories,
			// we need to hold all texts possible in the legend in order to let the chart pick the one it needs to display at runtime
			tooltipTexts: tooltipTexts,
			suffixText: suffixText,
			isRotated: isRotated,
			// a crook because of light-DOM to avoid problems w/ multiple charts
			uniquePrefix: "chartElement" + Math.floor(Math.random() * 10000),
			currentCols: [],
		})
		return this.get(chartDOMElementId)
	}

	static update(id, categories, suffixText, tooltipTexts) {
		const state = this.get(id)
		if(state) {
			state.categories = categories
			state.suffixText = suffixText
			state.tooltipTexts = tooltipTexts	
		}
		return state
	}

	static has(id) { return this.states.has(id) }
	static get(id) { return this.states.get(id) }
}

function getSeries(cols) { return cols.slice(1) }	// remove 1st array in col array yields all series' keys (see also head comment)
function getCategories(cols) { return cols[0] }


export function init(cfg) {
	if(States.has(cfg.chartDOMElementId)) {
		updateChart(getSeries(cfg.cols), States.update(cfg.chartDOMElementId, getCategories(cfg.cols), cfg.suffixText, cfg.tooltipTexts))
	} else {
		// create a new state, a new billoardjs-chart and hook up a legend to the chart
		connectLegend(createChart(States.add(cfg.chartDOMElementId, cfg.legendDOMElementId, getCategories(cfg.cols), cfg.tooltipTexts, cfg.suffixText, cfg.isRotated), cfg.type, getCategories(cfg.cols)))
		updateChart(getSeries(cfg.cols), States.get(cfg.chartDOMElementId))
		if(!toast) {
			toast = createToast(States.get(cfg.chartDOMElementId).uniquePrefix)	// any uniquePrefix would do really; just take from 1st chart out of convenience
		}
	}
}

function createChart(chartState, type, categories) {
	const cfg = {
		bindto: "#"+chartState.id,
		data: {
			columns: [],
			type: type
		},
		grid: grid(),
		axis: axis(categories, chartState.isRotated),
		tooltip: {
			show: true,
			format: {
				name: function (name, ratio, id, index) { return chartState.tooltipTexts.get(id) },
				value: function (value, ratio, id, index) { return value + chartState.suffixText }
			}
		},
		onresized: function() {
			displayMissingDataInLegend(chartState.currentCols, chartState.uniquePrefix)
		}
	
	}

	if(chartState.legendDOMElementId) {
		cfg["legend"] = legend(chartState.legendDOMElementId, chartState.uniquePrefix)
	} else {
		cfg["legend"] = {
			show: false,
			hide: true,
		}
	}

	chartState.chart = bb.generate(cfg)

	return chartState
}

export function updateChart(cols, chart) {
	chart.chart.load({
		unload: getDiff(chart.currentCols, cols), 	// smooth transition
		columns: cols,
		categories: chart.categories,
		done: function () {
			if(!displayMissingDataInLegend(cols, chart.uniquePrefix)) {
				toast.show()	// disappears by itself
			}
			//addLegendKeyboardNavigability(chart.legendDOMElementId)
		}
	})

	chart.currentCols = cols
}

export function setYLabel(chartDOMElementId, text) {
	States.get(chartDOMElementId).chart.axis.labels({ y: text })
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

function connectLegend(chartState) {
	document.head.insertAdjacentHTML("beforeend", legendCSS(chartState.uniquePrefix))
	const proxy = {
		focus: function(p) {chartState.chart.focus(p)}, 
		defocus: function(p) {chartState.chart.defocus(p)},
		getTooltipText: function(p) {return chartState.tooltipTexts.get(p)}
	}
	setChartInterface(proxy.focus, proxy.defocus, proxy.getTooltipText)
}
