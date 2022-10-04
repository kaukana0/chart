import {getTickIndices, shouldDrawLabel} from "./ticks/ticksAlt2.mjs"


const state = {
	zwickel: true,	//flipFlop
	labelCount: 0	
}


export function axis(categories, isRotated, domId) {
	
	const retVal = {
		x: {
			type: "category",
			categories: categories,
			tick: {
				centered: true,
				multiline: false,

				// this is a misnomer (in this situation).
				// it actually defines for which values to draw a tickmark.
				// returns array of ordinal numbers of those values (aka their index, 0-based)
				// without defining this explicitly, there'd be too many ticks on narrow screens
				values: function() {
					const noCategories = this.internal.config.axis_x_categories.length	// can't use "categories.length", it's always the value of the initial axis() call
					return getTickIndices(noCategories, width())
				},

				// this is a misnomer (in this situation).
				// it actually defines the tick text shown w/ option to show no text at all for a tick.
				// this depends on "values" - only for indices contained in values this is being called - so, no tick, no text.
				// this is being called twice - no idea why...
				format: function(index, categoryName) {
						if(state.zwickel) {
							state.zwickel = false
							return	// this fct is called twice, the first of which has no influence on anything visual...
						} else {
							const noCategories = this.internal.config.axis_x_categories.length	// can't use "categories.length", it's always the value of the initial axis() call
							state.zwickel = true
							state.labelCount += 1
							if( shouldDrawLabel(state.labelCount, noCategories, width()) ) {state.labelCount = 0}
							return state.labelCount === 0 ? categoryName : ""
					}
				}
			}
		},
		y: {
			label: {
				text: "",   // see setYLabel()
				position: "outer-middle"
			}
		}
	}

	function width() {return document.getElementById(domId).clientWidth }

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




export function axisCSS() {
    return `
<style>

.bb-axis-y-label {
  font-size: 1rem;
}

</style>
`
}