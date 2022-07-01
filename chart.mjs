import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setFocusMethods} from "./legend.mjs"
import toastHtml from "./toast.mjs"
import {grid, axis} from "./rest.mjs"


class States {
	static states = new Map()

	static add(chartDOMElementId, legendDOMElementId, bla, categories, unitText) {
		this.states.set(chartDOMElementId, {
			id: chartDOMElementId,
			legendDOMElementId: legendDOMElementId,
			bla: bla,
			categories: categories,
			unitText: unitText,
			// a crook because of light-DOM to avoid problems w/ multiple charts
			uniquePrefix: "chartElement" + Math.floor(Math.random() * 10000),
			currentCols: [],
		})
		return this.get(chartDOMElementId)
	}
	
	static has(id) { return this.states.has(id) }
	static get(id) { return this.states.get(id) }
}
let states = new States()

let toast



export function init(type, chartDOMElementId, legendDOMElementId, cols, bla, categories, unitText) {
	if(States.has(chartDOMElementId)) {
		update(cols, States.get(chartDOMElementId))
	} else {
		// create a new state, a new billoardjs-chart and hook up a legend to the chart
		connectLegend(createChart(States.add(chartDOMElementId, legendDOMElementId, bla, categories, unitText), type))
		update(cols, States.get(chartDOMElementId))
		if(!toast) {
			toast = createToast(States.get(chartDOMElementId).uniquePrefix)	// any uniquePrefix would do really; just take from 1st chart out of convenience
		}
	}
}

export function update(cols, chart) {
	chart.chart.load({
		unload: getDiff(chart.currentCols, cols), 	// smooth transition
		columns: cols,
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
				name: function (name, ratio, id, index) { return chartState.bla.get(id) },
				value: function (value, ratio, id, index) { return value + chartState.unitText }
			}
		},
		//legend: legend(chartState.legendDOMElementId, chartState.uniquePrefix)
	})
	return chartState
}

function connectLegend(chartState) {
	document.head.insertAdjacentHTML("beforeend", legendCSS(chartState.uniquePrefix))
	const proxy = {
		focus: function(p) {chartState.chart.focus(p)}, 
		defocus: function(p) {chartState.chart.defocus(p)}
	}
	setFocusMethods(proxy.focus, proxy.defocus)
}
