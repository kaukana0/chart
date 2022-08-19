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
