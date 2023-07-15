let currentSelection
let chartInterface = {}


// narrow interface; legend doesn't need to know more of the chart than just this
export function setChartInterface(uniqueId, _chartInterface) {
	chartInterface[uniqueId] = _chartInterface
}

export function legend(DOMElement, uniquePrefix) {
	return {
		position: "right",
		contents: {
			bindto: DOMElement,
			template: function (title, _) {
				// when chart.data specifies "color" instead of "colors",
				// initially this callback's second arg is undefined and all legend colors become black.
				// so, second arg (color) is useless in that case - maybe it's a billboard.js bug.
				const IF = chartInterface[uniquePrefix+"legend"]
				const color = IF.getColor(title)
				return `<div style="width:100%;">
					<span class="coloredDot" style="background-color:${color};"></span>
					<span class="bb-legend-item">${title}</span>
				</div>`
			}
		},
		item: {
			// the one clicked stays as is (it's getting "focussed on"), while all others fade out a little bit
			onclick: function (id) {
				const IF = chartInterface[uniquePrefix+"legend"]
				if (currentSelection) {
					if (id == currentSelection) {
						currentSelection = null
						IF.focus()
					} else {
						currentSelection = id
						IF.blur()
						window.requestAnimationFrame(() => IF.focus(id))
					}
				} else {
					currentSelection = id
					IF.focus()
					window.requestAnimationFrame(() => IF.focus(id))
				}
			},
			onover: function (id) { },
			onout: function (id) { },
		}
	}
}


// grey out legend elements that have no data
// cols is [["dataSeriesKey",..values...], ["dataSeriesKey",..values...]]
// returns true if any data exists at all, false othewise
export function displayMissingDataInLegend(cols, uniquePrefix) {
	let someDataExists = false

	cols.forEach(col => {
		const allValuesNull = col.slice(1).every(el => el === null)
		if (allValuesNull) {
			const el = document.getElementById(uniquePrefix + col[0])
			if(el) {
				el.setAttribute("style", "border-color: lightgrey; text-decoration: line-through;")
			} else {
				console.warn("legend: no element " + uniquePrefix + col[0])
			}
		} else {
			someDataExists = true
		}
	})

    return someDataExists
}


export function addLegendKeyboardNavigability(DOMElement) {
	// all span children under the element with given selector
	DOMElement.querySelectorAll("span")
	.forEach( e => {e.addEventListener("keydown", ke => {
			if(ke.keyCode==13) {
				ke.target.click()
			}
		})
	})
}

export function legendCSS(uniquePrefix) {
    return `
<style>

/* > bootstrap xs  legend is supposed to be on the right of chart */
@media screen and (min-width: 576px) {
  .${uniquePrefix} {
    display: block;
    border-left: 25px solid;
    margin-top:5px;
    padding-top: 0.7em; 
    padding-bottom: 0.7em; 
    padding-left: 10px;
    text-align: left;	/* left alignment when besides chart */
  }
}

/* < bootstrap xs   legend is supposed to be below chart */
@media (max-width: 576px) {
  .${uniquePrefix} {
    display: inline-block;
    padding-top: 5px;
    padding-left: 10px; 
    padding-right: 10px; 
    margin-top: 20px;
    margin-left: 10px;
    margin-right: 10px;
    border-top: 8px solid;
    /* text-center class in hmtl centers vertically when below chart */
  }
}

</style>
`
}