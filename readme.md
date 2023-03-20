# usage

note: see comment in chart.mjs for more details

## html

	<script src="./components/chartCard/chartCard.mjs" type="module"></script>
  	<div id="myChart"></div>

## js

	import * as Chart from "../components/chart/chart.mjs"

- From an OOP perspective, one could think of chart.mjs:Chart as a static class which internally has a list of instances.
- These instances are the state/config/context of each chart.
- Each instance is connected with a DOM element - upon creation of the context, it's given a ref to the DOM element. 

### init

	const cols = [
		[     	'08-2022', '09-2022', '10-2022', '11-2022', '12-2022'],
		['XY', 	4.5, 		5, 			5.3, 		3.6, 		1.4],
		['EO', 	-4.5, 		-5, 		2.1,		 5.6,		 0.4]
	]

	const labels = new Map()
	labels.set("XY","one series")
	labels.set("EO","another series")

	Chart.init({
		type: "line",
		chartDOMElementId: getElementById("..."),
		legendDOMElementId: getElementById("..."),
		cols: cols,
		fixColors: {},
		palette: ["#069F73", "#CC79A7"],
		seriesLabels: labels,
		suffixText: "%",
		isRotated: false,
		onFinished: () => console.log("fin")
	})

- It can be called repeadetly to set new data on it (so it's also "update").
- First time it has to be called w/ at least all mandatory arguments.
- Subsequent calls can omit all arguments - except of course the one to be changed (mostly, "cols").

### Chart.resize()

### Chart.setYLabel()
