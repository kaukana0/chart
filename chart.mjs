import {legend, displayMissingDataInLegend, addLegendKeyboardNavigability, legendCSS, setFocusMethods} from "./legend.mjs"
import toastHtml from "./toast.mjs"
import {grid, axis} from "./rest.mjs"

export let chart
let isInitialized = false
let currentCols = []
let toast
let uniquePrefix


export function init(type, chartCSSSelector, legendCSSSelector, cols, bla, categories, unitText) {
	
	if (isInitialized) {
		update(cols, legendCSSSelector)
	} else {
		isInitialized = true

		// a crook because of light-DOM to avoid problems w/ multiple charts
		uniquePrefix = "chartElement" + Math.floor(Math.random() * 10000)

		document.head.insertAdjacentHTML("beforeend", legendCSS(uniquePrefix))

		document.body.insertAdjacentHTML("beforeend", toastHtml(uniquePrefix + "toast"))
		toast = new bootstrap.Toast(document.getElementById(uniquePrefix + "toast"))

		chart = bb.generate({
			bindto: chartCSSSelector,
			data: {
				columns: [],
				type: type
			},
			grid: grid(),
			axis: axis(categories),
			tooltip: {
				show: true,
				format: {
					name: function (name, ratio, id, index) { return bla.get(id) },
					value: function (value, ratio, id, index) { return value + unitText }
				}
			},
			legend: legend(legendCSSSelector, uniquePrefix)
		})

		update(cols, legendCSSSelector)

		const proxy = {
			focus: function(p) {chart.focus(p)}, 
			defocus: function(p) {chart.defocus(p)}
		}
		setFocusMethods(proxy.focus, proxy.defocus)
	}
}


export function update(cols, legendCSSSelector) {
	chart.load({
		unload: getDiff(currentCols, cols), 	// smooth transition
		columns: cols,
		done: function () {
			if(!displayMissingDataInLegend(cols, uniquePrefix)) {
				toast.show()	// disappears by itself
			}
			addLegendKeyboardNavigability(legendCSSSelector)
		}
	})

	currentCols = cols
}

export function setYLabel(text) {
	chart.axis.labels({ y: text })
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
