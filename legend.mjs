let currentSelection
let chartInterface = {}


// narrow interface; legend doesn't need to know more of the chart than just this
export function setChartInterface(uniqueId, _chartInterface) {
	chartInterface[uniqueId] = _chartInterface
}


export function legend(DOMElement, uniquePrefix, behaviour) {
	const retVal = {}

	retVal["position"] = "right"
	retVal["contents"] = {bindto: DOMElement}

	retVal["contents"]["template"] = function (title, _) {
		// when chart.data specifies "color" instead of "colors",
		// initially this callback's second arg is undefined and all legend colors become black.
		// so, second arg (color) is useless in that case - maybe it's a billboard.js bug.
		const IF = chartInterface[uniquePrefix+"legend"]
		let color = IF.getColor(title)
		const titlePart = title.substring(0,2)

		if(titlePart==="EU") {color="#0E47CB"}	// TODO: that's a hack. do it right.

		return `<div style="width:100%; display:flex; align-items:center;" id="${uniquePrefix+title}">
			<span class="coloredDot" style="background-color:${color}; margin-right:10px;"></span>
			<span class="bb-legend-item" style="margin-bottom:8px;">${titlePart}</span>
		</div>`
	}

	retVal["item"] = {}

	if(behaviour==="hover") {

		retVal["item"]["onover"] = function (id) { 
			const IF = chartInterface[uniquePrefix+"legend"]
			IF.focus(id)
			//console.log("over legend",id) 
		}
		retVal["item"]["onout"] = function (id) { 
			const IF = chartInterface[uniquePrefix+"legend"]
			IF.focus()
			//console.log("out legend",id) 
		}
		retVal["item"]["onclick"] = function (){}

	} else {

		retVal["item"]["onclick"] = function (id) {
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
		}
		retVal["item"]["onover"] = function (id) { }
		retVal["item"]["onout"] = function (id) { }

	}

	return retVal
}


// grey out legend elements that have no data
// cols is [["dataSeriesKey",..values...], ["dataSeriesKey",..values...]]
// returns true if any data exists at all, false othewise
export function displayMissingDataInLegend(cols, uniquePrefix, root) {
	let someDataExists = false
	const totalCount = new Map()		// {"EU":[totalCount, allZerosCount]}
	const allZerosCount = new Map()

	cols.forEach(col => {
		const head = col[0]
		const headCut = head.substring(0,2)
		const tail = col.slice(1)
		totalCount.set(headCut, totalCount.has(headCut) ? totalCount.get(headCut)+1 : 1)
		const allZeros = tail.every(el => el === null)
		const currentCount = allZerosCount.has(headCut) ? allZerosCount.get(headCut) : 0
		const newCount = allZeros ? currentCount+1 : currentCount
		allZerosCount.set(headCut, newCount)
	})

	for(let [key, value] of totalCount) { 
		if(value===allZerosCount.get(key)) {	// all are missing
			if(root) {
				const id = uniquePrefix + key
				for (let i = 0; i < root.childNodes.length; i++) {
					const node = root.childNodes[i]
					if(node.hasAttribute("id")) {
						if(node.getAttribute("id").includes((id))) {
							node.childNodes[1].style.backgroundColor = "#BBB"
							node.childNodes[3].setAttribute("style",
								node.childNodes[3].getAttribute("style")+"text-decoration: line-through;")
						}
					}
				}
			}
		}
	}

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