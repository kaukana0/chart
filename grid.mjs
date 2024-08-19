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

// as established during a harmonization-dedicated meeting, end oct. 2023 and changed again to EU grey 40 later on
export function gridCSSNewStyle() {
return `
<style>

.bb-xgrid,
.bb-ygrid {
	stroke-dasharray: 8 4;
	stroke-width: 1px;
  shape-rendering: auto;
	stroke: #A8AAAF;		/* EU Grey 40 */
}

/* avoid blurry font */
g.bb-axis.bb-axis-x,
g.bb-axis.bb-axis-y {
	stroke: unset;
}

.bb-grid line {
	stroke: #A8AAAF;		/* EU Grey 40 */
}

</style>
`
}