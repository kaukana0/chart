/*

area of conflict: "avoid label overlap" vs. "not enough labels".
resolve by controlling #ticks and #ticks in between each label.


                    for all (widths, #Values) -> (#Ticks, #Ticks in between each label)

                                                │
                                                │ config
                                                │
                                                │
                            ┌───────────────────▼──────────────────────┐
   available draw width     │                                          │
                            │                                          │      [] of ticks to draw
─────────────────────────►  │     implementation                       │   ─────────────────────────►
                            │     of                                   │
   number of values         │     chart.axis.x.tick.{values,format}    │      getter for tick text
                            │                                          │
─────────────────────────►  │                                          │   ─────────────────────────►
                            │                                          │
                            └──────────────────────────────────────────┘


note: current implementation does not take "number of values"-input into account and is justified for about 100 values.

*/


const tickFac = 2		// increase some reasonable minimum
const cfg = {
	// graduation is a map imitation (array of arrays) key=width; value=divisions/ticks at that width
	// up to "key" pixel, use "value" ticks (bootstrap breakpoints)
	tickGraduation: 	  [[576, 5*tickFac], [768, 8*tickFac], [992, 14*tickFac], [1200, 17*tickFac], [1400, 19*tickFac], [Number.MAX_VALUE, 24*tickFac]],

	ticksInBetweenLabels: [[576, 1], 		 [768, 1], 		   [992, 1],		  [1200, 1], 		  [1400, 1], 		  [Number.MAX_VALUE, 1]],
	// note: empirically determined optimization for "in between" and ~100 values:
	// [good as is, < 40 values 0, < 12 vals 0, < 16 values 0, < 16 0, < 22 0]

	get: function(graduation, val) {
		return graduation.filter(([k, v]) => val<k)[0][1]
	}
}


const state = {
	zwickel: true,
	labelCount: 0	
}


export function axis(categories, isRotated, domId) {
	
	function width() {return document.getElementById(domId).clientWidth }

	// all the indices of ticks to draw - depending on available draw width
	function getTickIndices(noValues, drawAreaWidth) {
		const wantedTicks = cfg.get(cfg.tickGraduation, drawAreaWidth)
		const noTicks = wantedTicks>noValues ? noValues : wantedTicks
		const step = Math.max( Math.ceil(noValues / noTicks), 1)
		//console.debug(`chart axis: to label ${noValues} values in a draw area of ${drawAreaWidth} we use ${noTicks} ticks (wanted ${wantedTicks} ticks)`)
		const u = Array.from({length: noTicks}, (_, i) => i*step)
		return u
	}
	
	const retVal = {
		x: {
			type: "category",
			categories: categories,
			tick: {
				centered: true,
				multiline: false,

				// this is a misnomer.
				// it defines for which values to draw a tickmark.
				// returns array of ordinal numbers of those values (aka their index, 0-based)
				// without defining this explicitly, there'd be too many ticks on narrow screens
				values: function() {
					const noCategories = this.internal.config.axis_x_categories.length	// can't use "categories.length"
					return getTickIndices(noCategories, width())
				},

				// this is a misnomer. it defines the tick text shown w/ option to show no text at all for a tick.
				// this depends on "values" - only for indices contained in values this is called - so, no tick, no text.
				// this is being called twice - no idea why...
				format: function(index, categoryName) {
						if(state.zwickel) {
							state.zwickel = false
							return	// this fct is called twice, the first of which has no influence on anything visual...
						} else {
							state.zwickel = true
							state.labelCount += 1
							if(state.labelCount>cfg.get(cfg.ticksInBetweenLabels, width())) {state.labelCount = 0}
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