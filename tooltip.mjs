export function tooltip(context) {
	return {
		show: true,
		// this takes care of disappearing when clicking inside the chart.
		// disappearing by clicking anywhere else is up to the user of this component.
		doNotHide: false,
		order: (a, b) => a.value>b.value?-1:1,

		// misnomer: it's not a format, it's actual content...
		format: {
			name: function (name, ratio, id, index) { return context.seriesLabels.get(id) },
			value: function (value, ratio, id, index) { 
				return Number(value).toFixed(1) + context.suffixText 
			},
			// we have to take it from the context, because weirdly, by default, the title is
			// the tickmark label and if a tickmark doesn't have one, title is missing in the tooltip :-/
			title: function(x) { return context.categories[x] }
		}
	}	
}

export function tooltipCSS() {
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

</style>
`
}