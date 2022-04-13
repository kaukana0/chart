/**
 * processors : [extractCountryValues, extractCountries]
 * chart.init(data["bySiec"]["TOTAL"].cols, Object.keys(data.countries))
 */

let chart
let isInitialized = false

export function init(type, cols, categories) {
 
    if(isInitialized) {
      update(cols)
    } else {
      isInitialized = true
      
      chart = bb.generate({
        data: {
          columns: cols,
          type: type,
        },
        axis: {
          x: {
            type: "category",
            categories: categories
          }
        },
        bindto: "#chart",
        tooltip:{show:false},
        hide:["DE"]
      });
      //chart.hide();
      //chart.show(data.getDataSeriesShown());
    }  
}
 
export function update(cols) {
	chart.load({
		columns: cols
	})
}