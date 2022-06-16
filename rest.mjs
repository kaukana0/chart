export function grid() {
	return {
		y: {
			show: true,
			lines: [{ value: 0, text: '', class: 'line-0' }],
		}
	}
}


export function axis(categories) {
	return {
		x: {
			type: "category",
			categories: categories,
			tick: {
				centered: true,
				outer: false,
				multiline: false,
				useFit: false,
				culling: {
					max: 1
				},
				//rotate: -45
			}
		},
		y: {
			label: {
				text: "",   // see setYLabel()
				position: "outer-middle"
			}
		}
	}
}
