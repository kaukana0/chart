/**
 */

export let chart
let unitText  // maybe put in some kind of closure?
let isInitialized = false
let legendCurrentSelection
let uniquePrefix  // a crook because of light-DOM to avoid problems w/ multiple charts
let toast
let dataMissing = []


export function init(type, chartCSSSelector, legendCSSSelector, cols, bla, categories, unit) {
  unitText = unit
  
  if(isInitialized) {
    update(cols)
  } else {
    isInitialized = true
    uniquePrefix = "chartElement" + Math.floor(Math.random() * 10000)

    document.body.insertAdjacentHTML("beforeend", toastHtml())
    toast = new bootstrap.Toast(document.getElementById(uniquePrefix+"toast"))

    chart = bb.generate({
      bindto: chartCSSSelector,
      data: {
        columns: cols,
        type: type,
        onshown: function(ids) {  // NOT WORKING... WHY?
          console.log("H")
        }
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
    })
  }
}


export function update(cols) {
	chart.load({
    unload: true, // TODO - use the diff to make smooth transition
		columns: cols,
    done: function() {displayMissingDataInLegend(cols)}
  })
}

export function setYLabel(text) {
  chart.axis.labels({y: text})
}


function toastHtml() {
return `
<div class="toast-container position-absolute top-50 start-50 translate-middle" style="z-index: 50; background-color: #fff;">
  <div id="${uniquePrefix}toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <strong class="me-auto">Info</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      No data available for your selection.
      Please change your selection.
    </div>
  </div>
</div>
`}


function legend(legendCSSSelector) {

  function style() {
    return `
    <style>

    /* > bootstrap xs  legend is supposed to be on the right of chart */
    @media screen and (min-width: 576px) {
      .${uniquePrefix} {
        display: block;
        border-left: 25px solid;
        margin-top:5px;
        padding-top: 0.7em; 
        padding-bottom: 0.7em; 
        padding-left: 10px; 
      }
    }

    /* < bootstrap xs   legend is supposed to be below chart */
    @media (max-width: 576px) {
      .${uniquePrefix} {
        display: inline-block;
        padding-top: 5px;
        padding-left: 10px; 
        padding-right: 10px; 
        margin-top: 20px;
        margin-left: 10px;
        margin-right: 10px;
        border-top: 8px solid;
      }
    }

    .bb-tooltip th {
      background: black;
    }
    </style>
    `
  }

  document.head.insertAdjacentHTML("beforeend", style())    // :-/  do that not here

  return {
    position: "right",
    contents: {
      bindto: legendCSSSelector,
      template: function(title, color) {
        return `<span class="${uniquePrefix}" id="${uniquePrefix+title}" style="border-color: ${color};"> ${title} </span>`
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
        },
        //rotate: -45
      }
    },
    y: {
      label: {
        text: "",   // see setYLabel()
        position: "outer-middle"
      }
    }
  }
}


// grey out legend elements that have no data and show toast if there's not data at all.
// cols is [["dataSeriesName",..values...], ["dataSeriesName",..values...]]
function displayMissingDataInLegend(cols) {
  let someDataExists = false

  cols.forEach(col => {
    const allValuesNull = col.slice(1).every(el => el===null)
    if(allValuesNull) {
        document.getElementById(uniquePrefix+col[0]).setAttribute("style","border-color: lightgrey; text-decoration: line-through;")
    } else {
      someDataExists = true
    }
  })

  if(!someDataExists) {
    toast.show()
  }
}