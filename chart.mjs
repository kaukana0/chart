/**
 */

export let chart
let isInitialized = false


function legend(legendCSSSelector) {

  function style() {
    return `
    <style>

    /* > bootstrap xs  supposed to be on the right */
    @media screen and (min-width: 576px) {
      #chartLegend {
        display: block;
        border-left: 25px solid;
        padding-top: 0.7em; 
        padding-bottom: 0.7em; 
        padding-left: 10px; 
        margin-top:5px;
      }
    }

    /* < bootstrap xs   supposed to be below */
    @media (max-width: 576px) {
      #chartLegend {
        display: inline-block;
        margin-top: 20px;
        border-top: 8px solid;
        padding-top: 5px;
        padding-left: 10px; 
        padding-right: 10px; 
        margin-left: 10px;
        margin-right: 10px;
      }
    }

    </style>
    `
  }

  document.head.insertAdjacentHTML("beforeend", style())

  return {
    position: "right",
    contents: {
      bindto: legendCSSSelector,
      template: function(title, color) {
        return `<span id="chartLegend" style="border-color: ${color};">${title}</span>`
      }
    }
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

export function init(type, chartCSSSelector, legendCSSSelector, cols, categories) {
    if(isInitialized) {
      update(cols)
    } else {
      isInitialized = true
      
      chart = bb.generate({
        bindto: chartCSSSelector,
        data: {
          columns: cols,
          type: type,
        },
        grid: grid(),
        axis: axis(categories),
        tooltip:{show:true},
        legend: legend(legendCSSSelector)
      });
    }  
}
 
export function update(cols) {
	chart.load({
    unload: true, // TODO - use the diff to make smooth transition
		columns: cols
	})
}