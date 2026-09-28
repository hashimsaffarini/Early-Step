import '@testing-library/jest-dom/vitest';

/*
 * jsdom does not implement HTMLDialogElement.showModal/close.
 * Minimal stand-in: toggles the `open` attribute and fires `close`.
 */
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
