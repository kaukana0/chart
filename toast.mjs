/*
depends on bootstrap 5
*/

export function toastHtml(id) {
	return `
<div class="toast-container position-fixed top-50 start-50 translate-middle" style="z-index: 50; background-color: #fff;">
  <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="modal-header">
      <p class="h1" style="color:black;">Information</p>
      <button type="button" class="btn-close close" style="float:right;" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      No data available for your selection.<br>
      Please change your selection.
    </div>
  </div>
</div>
`}

export function toastCSS(id) {
  return `
<style>
.${id} {
  background-color: #fff;
}
.toast-body{
  font-size: var(--bs-body-font-size);
}
</style>
`}
