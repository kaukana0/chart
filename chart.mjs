/**
 */

export let chart
let unitText  // maybe put in some kind of closure?
let isInitialized = false
let legendCurrentSelection


function legend(legendCSSSelector) {

  function style() {
    return `
    <style>

    /* > bootstrap xs  legend is supposed to be on the right of chart */
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

    /* < bootstrap xs   legend is supposed to be below chart */
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

    .bb-tooltip th {
      background: black;
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
    },
    item: {
      // the one clicked stays as is, while all others fade out a little bit
      onclick: function(id) { 
        if(legendCurrentSelection) {
          if(id==legendCurrentSelection) {
            legendCurrentSelection = null
            chart.focus()
          } else {
            legendCurrentSelection = id
            chart.defocus()
            window.requestAnimationFrame(() => chart.focus(id) )
          }
        } else {
          legendCurrentSelection = id
          chart.defocus()
          window.requestAnimationFrame(() => chart.focus(id) )
        }
       },
       onover: function(id) {},
       onout: function(id) {},
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
      categories: categories,
      tick: {
        centered: true,
        outer: false,
        multiline: false,
        useFit: false,
        culling: {
          max: 1
        }
      }
    }
  }
}

export function init(type, chartCSSSelector, legendCSSSelector, cols, bla, categories, unit) {
    unitText = unit
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
        tooltip: {show:true,
        format: {
          name: function(name, ratio, id, index) { return bla.get(id) },
          value: function(value, ratio, id, index) { return value + unitText }
        }
        },
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