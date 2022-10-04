// just draw every tick
// equivalent to commenting out x.tick.values()
export function getTickIndices(noValues) {
    return Array.from({length: noValues}, (_, i) => i)
}

const max = Number.MAX_VALUE
const cfg = {
    // determined empirically for up to 100-200 values
    ticksInBetweenLabels: [
        [576, 12, 1],  // between 0 and 576
        [576, 16, 2],
        [576, 22, 3],
        [576, 27, 4],
        [576, 30, 5],
        [576, 37, 6],
        [576, 44, 8],
        [576, 48, 10],
        [576, 100, 20],
        [576, max, 40],
        [768, 12, 0],  // between 576 and 768
        [768, 30, 2],
        [768, 45, 3],
        [768, 50, 4],
        [768, 65, 5],
        [768, 80, 6],
        [768, 100, 8],
        [768, max, 10],
        [992, 15, 0],  // between 768 and 992
        [992, 30, 1],
        [992, 45, 2],
        [992, 60, 3],
        [992, 85, 4],
        [992, 100, 5],
        [992, max, 7],
        [1200, 20, 0],  // between 992 and 1200
        [1200, 40, 1],
        [1200, 65, 2],
        [1200, 70, 3],
        [1200, max, 5],
        [1400, 25, 0],  // between 1200 and 1400
        [1400, 50, 1],
        [1400, 70, 2],
        [1400, 90, 3],
        [1400, max, 5], // from 1400 on
        [max, 30, 0],
        [max, 60, 1],
        [max, 80, 2],
        [max, 100, 3],
        [max, max, 5],
    ],

    // below "index0" and below "index1" -> "index2"
	get: function(graduation, k1, k2) {
        const retVal = graduation.filter(([v1, v2, v3]) => {
            return k1<v1 && k2<v2 })
		return retVal[0][2] // 3rd element (#ticks) of the 1st filtered "row"
	}
}

export function shouldDrawLabel(currentTickCount, noValues, drawAreaWidth) {
    const noTicks = cfg.get(cfg.ticksInBetweenLabels, drawAreaWidth, noValues)
    //console.debug(`chart axis: to label ${noValues} values in a draw area of ${drawAreaWidth} we use ${noTicks} ticks`)
    return currentTickCount > noTicks
}
