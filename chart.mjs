/**
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
        tooltip:{show:true},
        legend: {
          position: "right",
          contents: {
            bindto: "#legend",
            template: function(title, color) {
              return `<span style='background-color: ${color}; padding:10px; margin-right:5px;'>
              ${title}
              </span>`
            }
          }
        },
      });
    }  
}
 
export function update(cols) {
	chart.load({
    unload: true, // TODO - use the diff to make it
		columns: cols
	})
}