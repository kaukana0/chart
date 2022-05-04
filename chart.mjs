/**
 */

export let chart
let isInitialized = false


function legend() {
  return {
    position: "right",
    contents: {
      bindto: "#legend",
      template: function(title, color) {
        //return `<div id="chartLegend" style='${style(color)}'>${title}</div>`
        return `<div id="chartLegend">${title}</div>` //${style(color)}
      }
    }
  }

  function style(color) {
    return `
    <style>

    /* < bootstrap xs */
    @media (max-width: 576px) {
      #chartLegend {
        border-top: 10px solid ${color};
        padding-top:10px; padding-bottom:10px; 
        padding-left:10px; margin-top:5px;
      }
    }

    /* > bootstrap xs */
    @media screen and (min-width: 576px) {
      #chartLegend {
        border-left: 20px solid ${color}; 
        padding-top:10px; padding-bottom:10px; 
        padding-left:10px; margin-top:5px;
      }
    }
    </style>
    `
  }
}

function grid() {
  return {
    y: {
      show: true,
      lines: [{ value: 0, text: '', class: 'line-0' }],
    }
  }
}

function axis(categories) {
  return {
    x: {
      type: "category",
      categories: categories
    }
  }
}

export function init(type, cols, categories) {
    if(isInitialized) {
      update(cols)
    } else {
      isInitialized = true
      
      chart = bb.generate({
        bindto: "#chart",
        data: {
          columns: cols,
          type: type,
        },
        grid: grid(),
        axis: axis(categories),
        tooltip:{show:true},
        legend: legend()
      });
    }  
}
 
export function update(cols) {
	chart.load({
    unload: true, // TODO - use the diff to make it
		columns: cols
	})
}