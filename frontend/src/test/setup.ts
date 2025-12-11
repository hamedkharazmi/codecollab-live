import "@testing-library/jest-dom";

// Polyfill Pointer Events API methods used by Radix UI for jsdom
if (typeof window !== 'undefined' && typeof (window as any).HTMLElement !== 'undefined') {
	const proto = (window as any).HTMLElement.prototype;

	if (typeof proto.hasPointerCapture !== 'function') {
		proto.hasPointerCapture = function () { return false; };
	}

	if (typeof proto.setPointerCapture !== 'function') {
		proto.setPointerCapture = function () { /* no-op for tests */ };
	}

	if (typeof proto.releasePointerCapture !== 'function') {
		proto.releasePointerCapture = function () { /* no-op for tests */ };
	}
  
	if (typeof proto.scrollIntoView !== 'function') {
		proto.scrollIntoView = function () { /* no-op for tests */ };
	}
}
