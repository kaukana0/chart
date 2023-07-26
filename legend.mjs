let currentSelection
let chartInterface = {}


/*
this adapts the drawing of legend items to
- some billboardjs black-box (undocumented) weirdness (counter1)
- some business logic (counter2)

counter1:
the legend template function gets called multiple times.
in some cases, the 2nd call is actually what's being displayed, sometimes the 1st.
this is amended w/ resetting from outside, depending on the situation.
it's determined empirically.

counter2:
we have groups of three items, for which only 1 legend element should be displayed.
*/
class Adapter {
	static counter1 = new Map()
	static counter2 = []
	static drawWhen = 1
	
	static reset(drawWhen) {
		this.counter1.clear()
		this.counter2.length = 0
		this.drawWhen = drawWhen
	}

	// only do it the n-the time
	static cond1(k) {
		if(this.counter1.has(k)) {
			this.counter1.set(k, this.counter1.get(k)>=2?2:this.counter1.get(k)+1 )
		} else {
			this.counter1.set(k,0)
		}
		return this.counter1.get(k)===this.drawWhen
	} 

	// only do it 1 time
	static cond2(k) {
		if(this.counter2.includes(k)) {
			return false
		} else {
			this.counter2.push(k)
			return true
		}
	}
}

export function resetCounter(drawWhen=1) {
	Adapter.reset(drawWhen)
}

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

				// TODO: this stuff is project specific. The adapter too. get it out of here.
				if(Adapter.cond1(title)) {
					const titlePart = title.substring(0,2)
					if(Adapter.cond2(titlePart)) {
						return `<div style="width:100%; display:flex; align-items:center;">
							<span class="coloredDot" style="background-color:${color}; margin-right:10px;"></span>
							<span class="bb-legend-item" style="margin-bottom:8px;">${titlePart}</span>
						</div>`
					} else {
						return `<div style="width:100%; height:0px; padding:0px;"></div>`
					}
				} else {
					return `<div style="width:100%; height:0px;"></div>`
				}

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