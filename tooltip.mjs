export function tooltip(context) {
	return {
		show: true,
		// this takes care of disappearing when clicking inside the chart.
		// disappearing by clicking anywhere else is up to the user of this component.
		doNotHide: false,
		order: (a, b) => a.value>b.value?-1:1,

		// misnomer: it's not a format, it's actual content...
		format: {
			name: (name, ratio, id, index) => context.seriesLabels ? context.seriesLabels.get(id) : "",
			value: (value, ratio, id, index) => Number(value).toFixed(1) + (context.suffixText?context.suffixText:""),
			// we have to take it from the context, because weirdly, by default, the title is
			// the tickmark label and if a tickmark doesn't have one, title is missing in the tooltip :-/
			title: (x) => context.categories?context.categories[x]:""
		}
	}	
}

export function tooltipCSS() {
    return `
<style>


.bb-tooltip tbody tr td.value {
	text-align:right;
}

.bb-tooltip th {
	font-size: 14px;
	font-weight: bold;
  background: #333;
	text-align: left;
	padding-top: 5px;
	padding-bottom: 5px;
}

.bb-tooltip-container table tbody tr th {
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
}

#chart > div > table > tbody td.name {
	display: flex;
	align-items: center;
}

.bb-tooltip-container {
	background: white;
}

/* that's the blob left of the text */
.bb-tooltip tbody tr td span {
	border-radius: 8px;
	width:16px;
	height:16px;
}

</style>
`
}
