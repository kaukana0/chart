import {getTickIndices, shouldDrawLabel} from "./ticks/ticksAlt2.mjs"


const state = {
	flipFlop: true,
	labelCount: 0	
}


export function axis(categories, isRotated, domId, labelEveryTick, centered, padding) {
	

	const x = {
		type: "category",
		categories: categories,
		tick: {
			centered: centered,
			multiline: false,
			//autorotate: true,
			//rotate: 15,
			outer: false,

			// this is a misnomer (in this situation).
			// it actually defines for which values to draw a tickmark.
			// returns array of ordinal numbers of those values (aka their index, 0-based)
			// without defining this explicitly, there'd be too many ticks on narrow screens
			values: function() {
				const noCategories = this.internal.config.axis_x_categories.length	// can't use "categories.length", it's always the value of the initial axis() call
				return getTickIndices(noCategories, domId.clientWidth)
			},

			// this is a misnomer (in this situation).
			// it actually defines the tick text shown w/ option to show no text at all for a tick.
			// this depends on "values" - only for indices contained in values this is being called - so, no tick, no text.
			// this is being called twice - no idea why...
			format: function(index, categoryName) {
				if(labelEveryTick) {
					return categoryName 
				} else {
					if(state.flipFlop) {
						state.flipFlop = false
						return	// this fct is called twice, the first of which has no influence on anything visual...
					} else {
						const noCategories = this.internal.config.axis_x_categories.length	// can't use "categories.length", it's always the value of the initial axis() call
						state.flipFlop = true
						state.labelCount += 1
						if( shouldDrawLabel(state.labelCount, noCategories, domId.clientWidth) ) {state.labelCount = 0}
						return state.labelCount === 0 ? categoryName : ""
					}
				}
			}

		}
	}

	//{left: -0.2,	right: -0.2, unit: "%"}   
	if(padding) {
		x["padding"] = padding
	}

	const retVal = {
		x: x,
		y: {
			label: {
				text: "",   // see setYLabel()
				position: "outer-middle"
			},
			tick: {
				show:false,		// TODO: make configurable
				format: function(val) {
          return Intl.NumberFormat("en-US",{minimumFractionDigits:0}).format(val).replaceAll(","," ")
      	}
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



// TODO: hide-line doesn't belong here!
export function axisCSS() {
    return `
<style>

.bb-axis-x{
	font-size: 0.7rem;
	stroke-width: 0.9px;
	stroke: #6C7079;
	stroke-opacity: 0.8;
	font-family: Arial, sans-serif;
}

.bb-axis-y{
	font-size: 0.7rem;
	stroke-width: 0.6px;
	stroke: #6C7079;
	stroke-opacity: 1;
	font-family: Arial, sans-serif;
}

.bb-axis-y path{ 
	stroke-width: 0;	
}

.bb-axis-y-label {
  font-size: 0.8rem;
}



.hide-line { stroke-width: 0px; }



</style>
`
}
