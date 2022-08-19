import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setFocusMethods} from "./legend.mjs"
import toastHtml from "./toast.mjs"
import {grid, axis} from "./rest.mjs"


class States {
	static states = new Map()

	static add(chartDOMElementId, legendDOMElementId, tooltipTexts, suffixText, isRotated) {
		this.states.set(chartDOMElementId, {
			id: chartDOMElementId,
			legendDOMElementId: legendDOMElementId,
			tooltipTexts: tooltipTexts,
			suffixText: suffixText,
			isRotated: isRotated,
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

/*
cfg = {
	type: ,						// "line" or "bar" etc.
	chartDOMElementId: ,		// to which DOM elelement to attach the chart
	legendDOMElementId: ,		// to which DOM elelement to attach the legend; null means no legend
	// cols data format:
	// [
	//   ["x", "EU", "AT", "DK"],
	// 	 ["", 10, 20, 30] 
	// ]
	cols: ,
	tooltipTexts: ,				// a Map(). key=category. values are being displayed in the tooltip.
								// note: category = first array in cols w/o 1st element.
	suffixText: ,				// for display in tooltip
	isRotated: 					// true makes it vertical and changes some visual details
}
*/
export function init(cfg) {
	if(States.has(cfg.chartDOMElementId)) {
		update(cfg.cols, States.get(cfg.chartDOMElementId))
	} else {
		const categories = cfg.cols[0].slice(1) // an array containing elements for the main axis - similar to the first array in cols w/o 1st element.
		// create a new state, a new billoardjs-chart and hook up a legend to the chart
		connectLegend(createChart(States.add(cfg.chartDOMElementId, cfg.legendDOMElementId, cfg.tooltipTexts, cfg.suffixText, cfg.isRotated), cfg.type, categories))
		update(cfg.cols, States.get(cfg.chartDOMElementId))
		if(!toast) {
			toast = createToast(States.get(cfg.chartDOMElementId).uniquePrefix)	// any uniquePrefix would do really; just take from 1st chart out of convenience
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

function createChart(chartState, type, cols) {
	const cfg = {
		bindto: "#"+chartState.id,
		data: {
			columns: [],
			type: type
		},
		grid: grid(),
		axis: axis(cols, chartState.isRotated),
		tooltip: {
			show: true,
			format: {
				name: function (name, ratio, id, index) { return chartState.tooltipTexts.get(id) },
				value: function (value, ratio, id, index) { return value + chartState.suffixText }
			}
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

function connectLegend(chartState) {
	document.head.insertAdjacentHTML("beforeend", legendCSS(chartState.uniquePrefix))
	const proxy = {
		focus: function(p) {chartState.chart.focus(p)}, 
		defocus: function(p) {chartState.chart.defocus(p)}
	}
	setFocusMethods(proxy.focus, proxy.defocus)
}
