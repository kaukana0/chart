/*
note:
this implementation does not take "number of values"-input into account.
It's justified for about 100 values - many more values cause overlapping.
*/

const tickFac = 2		// increase some reasonable minimum
const cfg = {
	// graduation is a map imitation (array of arrays) - kind of a look-up-table
    // key=width; value=divisions/ticks at that width
	// up to "key" pixel, use "value" ticks (bootstrap breakpoints)
	tickGraduation: 	  [[576, 5*tickFac], [768, 8*tickFac], [992, 14*tickFac], [1200, 17*tickFac], [1400, 19*tickFac], [Number.MAX_VALUE, 24*tickFac]],

	ticksInBetweenLabels: [[576, 1], 		 [768, 1], 		   [992, 1],		  [1200, 1], 		  [1400, 1], 		  [Number.MAX_VALUE, 1]],
	// note: empirically determined optimization for "in between" and ~100 values:
	// [good as is, < 40 values 0, < 12 vals 0, < 16 values 0, < 16 0, < 22 0]
    // this optimization is not implemented.

	get: function(graduation, val) {
		return graduation.filter(([k, v]) => val<k)[0][1]
	}
}

// return array of all the indices of ticks to draw - depending on available draw width
export function getTickIndices(noValues, drawAreaWidth) {
    const wantedTicks = cfg.get(cfg.tickGraduation, drawAreaWidth)
    const noTicks = wantedTicks>noValues ? noValues : wantedTicks
    const step = Math.max( Math.ceil(noValues / noTicks), 1)
    //console.debug(`chart axis: to label ${noValues} values in a draw area of ${drawAreaWidth} we use ${noTicks} ticks (wanted ${wantedTicks} ticks)`)
    const u = Array.from({length: noTicks}, (_, i) => i*step)
    return u
}

// return boolean
export function shouldDrawLabel(currentTickCount, noValues, drawAreaWidth) {
    return currentTickCount > cfg.get(cfg.ticksInBetweenLabels, drawAreaWidth)
}
