export default function toastHtml(id) {
	return `
<div class="toast-container position-fixed top-50 start-50 translate-middle" style="z-index: 50; background-color: #fff;">
  <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="modal-header">
      <h1 style="color:black;">Information</h1>
      <button type="button" class="btn-close close" style="float:right;" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      No data available for your selection.<br>
      Please change your selection.
    </div>
  </div>
</div>
<style>
.${id} {
  background-color: #fff;
}
</style>
`}
