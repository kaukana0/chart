export function grid() {
	return {
		y: {
			show: true,
			lines: [{ value: 0, text: '', class: 'line-0' }],
		}
	}
}

export function gridCSS() {
    return `
<style>

.bb-ygrid {
	shape-rendering: auto;
  }

	.bb-grid line {
		stroke: #DEDFE0;
		stroke-width: 2px;
		stroke-dasharray: 2 4;
	}

	</style>
`
}

// as established during a harmonization-dedicated meeting, end oct. 2023
export function gridCSSNewStyle() {
return `
<style>

.bb-xgrid,
.bb-ygrid {
	stroke-dasharray: 8 4;
	shape-rendering: crispEdges; 
}

/* avoid blurry font */
g.bb-axis.bb-axis-x,
g.bb-axis.bb-axis-y {
	stroke: unset;
}

.bb-grid line {
	stroke: #7D8088;		/* EU Grey 60 */
}

</style>
`
}