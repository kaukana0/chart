import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setChartInterface} from "./legend.mjs"
import toastHtml from "./toast.mjs"
import {grid, axis} from "./rest.mjs"


let toast		// tasty but unhealthy


class State {
	static states = new Map()

	static add(chartDOMElementId, legendDOMElementId, allLegendTexts, categories, unitText) {
		this.states.set(chartDOMElementId, {
			id: chartDOMElementId,
			legendDOMElementId: legendDOMElementId,
			allLegendTexts: allLegendTexts,
			categories: categories,
			unitText: unitText,
			// a crook because of light-DOM to avoid problems w/ multiple charts
			uniquePrefix: "chartElement" + Math.floor(Math.random() * 10000),
			currentCols: [],
		})
		return this.get(chartDOMElementId)
	}

	static update(id, categories, unitText, allLegendTexts) {
		const state = this.get(id)
		if(state) {
			state.categories = categories
			state.unitText = unitText
			// we need to hold all texts possible in the legend in order to let the chart pick the one it needs to display at runtime
			state.allLegendTexts = allLegendTexts	
		}
		return state
	}
	
	static has(id) { return this.states.has(id) }
	static get(id) { return this.states.get(id) }
}


export function init(type, chartDOMElementId, legendDOMElementId, cols, allLegendTexts, categories, unitText) {
	if(State.has(chartDOMElementId)) {
		updateChart(cols, State.update(chartDOMElementId, categories, unitText, allLegendTexts))
	} else {
		// create a new state, a new billoardjs-chart and hook up a legend to the chart
		connectLegend(createChart(State.add(chartDOMElementId, legendDOMElementId, allLegendTexts, categories, unitText), type))
		updateChart(cols, State.get(chartDOMElementId))
		if(!toast) {
			toast = createToast(State.get(chartDOMElementId).uniquePrefix)	// any uniquePrefix would do really; just take from 1st chart out of convenience
		}
	}
}

function createChart(chartState, type) {
	chartState.chart = bb.generate({
		bindto: "#"+chartState.id,
		data: {
			columns: [],
			type: type
		},
		grid: grid(),
		axis: axis(chartState.categories),
		tooltip: {
			show: true,
			format: {
				name: function (name, ratio, id, index) { return chartState.allLegendTexts.get(id) },
				value: function (value, ratio, id, index) { return value + chartState.unitText }
			}
		},
		legend: legend(chartState.legendDOMElementId, chartState.uniquePrefix)
	})
	return chartState
}

export function updateChart(cols, chart) {
	chart.chart.load({
		unload: getDiff(chart.currentCols, cols), 	// smooth transition
		columns: cols,
		categories: chart.categories,
		//axes: axis(chartState.categories),
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
	State.get(chartDOMElementId).chart.axis.labels({ y: text })
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
		getTooltipText: function(p) {return chartState.allLegendTexts.get(p)}
	}
	setChartInterface(proxy.focus, proxy.defocus, proxy.getTooltipText)
}
