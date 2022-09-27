export function grid() {
	return {
		y: {
			show: true,
			lines: [{ value: 0, text: '', class: 'line-0' }],
		}
	}
}


export function axis(categories, isRotated) {
	const retVal = {
		x: {
			type: "category",
			categories: categories,
			tick: {
				centered: true,
				outer: false,
				multiline: false,
				useFit: true,
				rotate: -45,
				autorotate: true
			}
		},
		y: {
			label: {
				text: "",   // see setYLabel()
				position: "outer-middle"
			}
		}
	}

	if(isRotated) {
		retVal["rotated"]=true
		retVal["y2"] = {}
		retVal["y2"]["show"]=true	//this puts the axis on top instad of the bottom
		retVal["y"]["show"]=false
		retVal["y"]["tick"] = {}
		retVal["y"]["tick"]["show"]=false
	}

	return retVal;
}

export function tooltip(context) {
	return {
		show: true,
		// this takes care of disappearing when clicking inside the chart.
		// disappearing by clicking anywhere else is up to the user of this component.
		doNotHide: false,
		order: (a, b) => a.value>b.value?-1:1,

		// it's not a format, it's actual content...
		format: {
			name: function (name, ratio, id, index) { return context.seriesLabels.get(id) },
			value: function (value, ratio, id, index) { 
				return Number(value).toFixed(1) + context.suffixText 
			}
		}
	}	
}


export function chartCSS() {
    return `
<style>

.bb-tooltip th {
  background: black;
}

.bb-tooltip tbody tr td.value {
	text-align:right;
	text-color:green;
}

.bb-tooltip-container {
	background: white;
  }
 
  .bb-ygrid {
	stroke-dasharray: 8 4;
	shape-rendering: inherit;
  }
  

.bb-axis-y-label {
  font-size: 1rem;
}

</style>
`
}