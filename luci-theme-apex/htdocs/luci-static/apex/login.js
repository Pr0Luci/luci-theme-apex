/*
 * luci-theme-apex - login.js
 * Copyright (C) 2026 Pr0Luci
 * SPDX-License-Identifier: GPL-2.0-only
 *
 * Progressive enhancement only: the login form is fully functional without
 * this file. It reveals the show-password toggle (a `hidden` button in the
 * markup) and wires the standard toggle-button pattern (aria-pressed).
 * Vanilla ES5.
 */
'use strict';

(function() {
	function init() {
		var btn = document.querySelector('[data-al-reveal]');
		var input = btn ? document.getElementById(btn.getAttribute('aria-controls')) : null;

		if (!btn || !input)
			return;

		function setVisible(show) {
			input.type = show ? 'text' : 'password';
			btn.setAttribute('aria-pressed', show ? 'true' : 'false');
		}

		btn.addEventListener('click', function() {
			setVisible(input.type === 'password');
			input.focus();
		});

		/* never leave the password readable after a back/forward-cache restore */
		window.addEventListener('pageshow', function(ev) {
			if (ev.persisted)
				setVisible(false);
		});

		input.parentNode.classList.add('al-in--toggle');
		btn.hidden = false;
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', init);
	else
		init();
})();
