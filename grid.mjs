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