/*
 * luci-theme-apex - apex.js
 * Copyright (C) 2026 Pr0Luci
 * SPDX-License-Identifier: GPL-2.0-only
 *
 * Theme runtime: renders the sidebar navigation from the LuCI ui.menu
 * API (ACL-scrubbed, session-cached tree served at admin/menu) and
 * drives the mobile drawer. Vanilla ES only - no frameworks.
 */
'use strict';

(function() {
	var DRAWER_CLASS = 'ax-drawer-open';

	function closeDrawer() {
		document.body.classList.remove(DRAWER_CLASS);
		var btn = document.getElementById('ax-menu-toggle');
		if (btn)
			btn.setAttribute('aria-expanded', 'false');
	}

	function initDrawer() {
		var btn = document.getElementById('ax-menu-toggle');
		var backdrop = document.getElementById('ax-backdrop');

		if (btn)
			btn.addEventListener('click', function() {
				var open = document.body.classList.toggle(DRAWER_CLASS);
				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			});

		if (backdrop)
			backdrop.addEventListener('click', closeDrawer);

		document.addEventListener('keydown', function(ev) {
			if (ev.key === 'Escape')
				closeDrawer();
		});
	}

	/* light/dark toggle. The stored choice is applied before first paint by the
	   inline script in header.ut (data-theme on <html>); with no stored choice the
	   theme follows the OS (prefers-color-scheme) and live-follows OS changes. */
	var THEME_KEY = 'ax-theme';

	function effectiveTheme() {
		var t = document.documentElement.getAttribute('data-theme');
		if (t === 'light' || t === 'dark')
			return t;
		return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
	}

	function initTheme() {
		var btn = document.getElementById('ax-theme-toggle');
		if (!btn)
			return;

		function sync() {
			var target = effectiveTheme() === 'dark' ? 'light' : 'dark';
			var label = btn.getAttribute('data-label-' + target) || '';
			btn.setAttribute('data-target', target);
			btn.setAttribute('aria-label', label);
			btn.title = label;
		}

		btn.addEventListener('click', function() {
			var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
			document.documentElement.setAttribute('data-theme', next);
			try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
			sync();
		});

		if (window.matchMedia) {
			var mq = window.matchMedia('(prefers-color-scheme: light)');
			var follow = function() {
				if (!document.documentElement.hasAttribute('data-theme'))
					sync();
			};
			if (mq.addEventListener)
				mq.addEventListener('change', follow);
			else if (mq.addListener)
				mq.addListener(follow);
		}

		sync();
		btn.hidden = false;
	}

	/* range sliders: WebKit/Blink have no progress pseudo-element, so mirror the value
	   into --ax-p (0..1); the track gradient in cascade.css paints the filled part */
	function syncRange(el) {
		var min = parseFloat(el.min), max = parseFloat(el.max), val = parseFloat(el.value);
		if (isNaN(min)) min = 0;
		if (isNaN(max)) max = 100;
		var p = (max > min && !isNaN(val)) ? (val - min) / (max - min) : 0;
		el.style.setProperty('--ax-p', String(Math.min(1, Math.max(0, p))));
	}

	function initRanges(root) {
		root.querySelectorAll('input[type="range"]').forEach(syncRange);
	}

	function watchRanges() {
		function onValue(ev) {
			if (ev.target && ev.target.matches && ev.target.matches('input[type="range"]'))
				syncRange(ev.target);
		}

		initRanges(document);
		document.addEventListener('input', onValue, true);
		document.addEventListener('change', onValue, true);

		/* LuCI builds its widgets after load */
		if (window.MutationObserver)
			new MutationObserver(function(muts) {
				muts.forEach(function(m) {
					m.addedNodes.forEach(function(n) {
						if (n.nodeType !== 1)
							return;
						if (n.matches('input[type="range"]'))
							syncRange(n);
						else
							initRanges(n);
					});
				});
			}).observe(document.body, { childList: true, subtree: true });
	}

	function isActiveTrail(path) {
		var cur = (window.L && L.env && L.env.dispatchpath) ? L.env.dispatchpath : [];
		for (var i = 0; i < path.length; i++)
			if (cur[i] !== path[i])
				return false;
		return path.length > 0;
	}

	function navLink(node, path, cls) {
		var a = document.createElement('a');
		a.className = cls + (isActiveTrail(path) ? ' ax-active' : '');
		a.href = L.url.apply(L, path);
		a.textContent = node.title;
		a.addEventListener('click', closeDrawer);
		return a;
	}

	/* node tab strips: the sidebar covers two menu levels (category +
	   page); any deeper node with siblings (firewall zones/rules, adblock
	   sub-pages, nlbw display/config/backup, …) gets a horizontal strip -
	   stock renders these too; without them deep pages are unreachable */
	function renderNodeTabs(ui, root) {
		var main = document.getElementById('maincontent');
		var cur = (window.L && L.env && L.env.dispatchpath) ? L.env.dispatchpath : [];
		if (!main || cur.length < 3)
			return;

		var wrap = document.createElement('div');
		wrap.id = 'ax-nodetabs';

		/* walk the RAW tree for traversal - getChildren() rewrites alias
		   nodes to their target (whose children are empty), which would
		   truncate the walk (e.g. services/adblock is an alias to its
		   overview child). getChildren() is only used to LIST a strip. */
		var node = root, path = [];
		for (var d = 0; d < cur.length && node; d++) {
			node = (node.children || {})[cur[d]];
			if (!node || node.satisfied === false)
				break;
			path.push(cur[d]);

			/* strips start below the sidebar's two levels (category+page) */
			if (path.length >= 3) {
				var kids = ui.menu.getChildren(node);
				if (kids.length > 1) {
					var active = cur[path.length];
					var base = path.slice();
					var ul = document.createElement('ul');
					ul.className = 'ax-nodetab-strip';
					kids.forEach(function(kid) {
						var li = document.createElement('li');
						var a = document.createElement('a');
						a.href = L.url.apply(L, base.concat([ kid.name ]));
						a.textContent = kid.title;
						a.addEventListener('click', closeDrawer);
						if (kid.name === active)
							li.className = 'ax-active';
						li.appendChild(a);
						ul.appendChild(li);
					});
					wrap.appendChild(ul);
				}
			}
		}

		if (wrap.children.length) {
			var view = document.getElementById('view');
			main.insertBefore(wrap, view ?? main.firstElementChild.nextSibling);
			var act = wrap.querySelector('.ax-active');
			if (act && act.scrollIntoView)
				act.scrollIntoView({ block: 'nearest', inline: 'center' });
		}
	}

	/* empty-section placeholder <td> has no colspan - under column width
	   templates it crushes into the first column; CSS cannot span it */
	function fixPlaceholderSpan() {
		document.querySelectorAll('table .tr.placeholder > .td:only-child').forEach(function(td) {
			if (td.tagName === 'TD')
				td.colSpan = 100;
		});
	}

	function renderMenu(ui, root) {
		var tree = document.getElementById('ax-navtree');
		if (!tree)
			return;

		/* top level is normally the single 'admin' node */
		var tops = ui.menu.getChildren(root);
		var frag = document.createDocumentFragment();

		tops.forEach(function(top) {
			var topPath = [ top.name ];

			ui.menu.getChildren(top).forEach(function(cat) {
				/* Log out lives in the sidebar account block (header.ut) */
				if (cat.name === 'logout')
					return;

				var catPath = topPath.concat([ cat.name ]);
				var kids = ui.menu.getChildren(cat);

				if (!kids.length) {
					frag.appendChild(navLink(cat, catPath, 'ax-navlink ax-navtop'));
					return;
				}

				var group = document.createElement('div');
				var expanded = isActiveTrail(catPath);
				group.className = 'ax-navgroup';
				group.setAttribute('data-expanded', expanded ? 'true' : 'false');

				var head = document.createElement('button');
				head.type = 'button';
				head.className = 'ax-navcat';
				head.setAttribute('aria-expanded', expanded ? 'true' : 'false');
				head.textContent = cat.title;
				head.addEventListener('click', function() {
					var on = group.getAttribute('data-expanded') === 'true';
					group.setAttribute('data-expanded', on ? 'false' : 'true');
					head.setAttribute('aria-expanded', on ? 'false' : 'true');
				});
				group.appendChild(head);

				var list = document.createElement('ul');
				list.className = 'ax-navlist';

				kids.forEach(function(leaf) {
					var li = document.createElement('li');
					li.appendChild(navLink(leaf, catPath.concat([ leaf.name ]), 'ax-navlink'));
					list.appendChild(li);
				});

				group.appendChild(list);
				frag.appendChild(group);
			});
		});

		tree.textContent = '';
		tree.appendChild(frag);

		var active = tree.querySelector('.ax-navlink.ax-active');
		if (active && active.scrollIntoView)
			active.scrollIntoView({ block: 'nearest' });
	}

	/* tab strips overflow-x scroll on narrow viewports - make sure the
	   active tab starts in view (ui.js builds the strip after view load) */
	function revealActiveTabs() {
		document.querySelectorAll('ul.cbi-tabmenu li.cbi-tab').forEach(function(li) {
			var strip = li.parentNode;
			if (strip.scrollWidth > strip.clientWidth)
				li.scrollIntoView({ block: 'nearest', inline: 'center' });
		});
	}

	document.addEventListener('DOMContentLoaded', function() {
		initDrawer();
		initTheme();
		watchRanges();

		document.addEventListener('luci-loaded', function() {
			revealActiveTabs();
			fixPlaceholderSpan();
			initRanges(document);
			setTimeout(function() {
				revealActiveTabs();
				fixPlaceholderSpan();
				initRanges(document);
			}, 400);
		});

		if (!window.L || !document.body.classList.contains('ax-auth'))
			return;

		L.require('ui').then(function(ui) {
			return ui.menu.load().then(function(root) {
				renderMenu(ui, root);
				renderNodeTabs(ui, root);
			});
		}).catch(function(err) {
			if (window.console && console.error)
				console.error('apex: menu render failed', err);
		});
	});
})();
