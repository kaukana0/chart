export default function toastHtml(id) {
	return `
<div class="toast-container position-fixed top-50 start-50 translate-middle" style="z-index: 50; background-color: #fff;">
  <div id="${id}" class="toast text-white bg-primary" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <strong class="me-auto">Info</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body text-center">
      No data available for your selection.<br>
      Please change your selection.
    </div>
  </div>
</div>
`}
