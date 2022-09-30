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
	stroke-dasharray: 8 4;
	shape-rendering: inherit;
  }
  
</style>
`
}