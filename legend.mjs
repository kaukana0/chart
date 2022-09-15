let currentSelection
let chartInterface


// narrow interface; legend doesn't need to know more of the chart than just this
export function setChartInterface(_chartInterface) {
	chartInterface = _chartInterface
}

export function legend(DOMElementId, uniquePrefix) {
	return {
		position: "right",
		contents: {
			bindto: "#" + DOMElementId,
			template: function (title, _) {
				// when chart.data specifies "color" instead of "colors",
				// initially this callback's second arg is undefined and all legend colors become black.
				// so, second arg (color) is useless in that case - maybe it's a billboard.js bug.
				return `<span class="${uniquePrefix}" id="${uniquePrefix + title}" style="border-color: ${chartInterface.getColor(title)};" tabindex=0 title="${chartInterface.getTooltipText(title)}"> ${title} </span>`
			}
		},
		item: {
			// the one clicked stays as is (it's getting "focussed on"), while all others fade out a little bit
			onclick: function (id) {
				if (currentSelection) {
					if (id == currentSelection) {
						currentSelection = null
						chartInterface.focus()
					} else {
						currentSelection = id
						chartInterface.defocus()
						window.requestAnimationFrame(() => focusLegendElement(id))
					}
				} else {
					currentSelection = id
					focusLegendElement()
					window.requestAnimationFrame(() => focusLegendElement(id))
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
			document.getElementById(uniquePrefix + col[0]).setAttribute("style", "border-color: lightgrey; text-decoration: line-through;")
		} else {
			someDataExists = true
		}
	})

    return someDataExists
}


export function addLegendKeyboardNavigability(DOMElementId) {
	// all span children under the element with given selector
	document.querySelector(DOMElementId).querySelectorAll("span")
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

.bb-tooltip th {
  background: black;
}

.bb-axis-y-label {
  font-size: 1rem;
}

</style>
`
}