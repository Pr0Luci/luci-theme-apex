# luci-theme-apex

Part of [CleanWRT](https://github.com/Pr0Luci/cleanwrt-aw1000). Documentation: [The Apex theme](https://pr0luci.github.io/cleanwrt-aw1000/docs/theme/).

A LuCI 25.12 theme for the Arcadyan AW1000: dense and technical, dark by default with an automatic
light mode (and a manual toggle), a sidebar with a mobile drawer, and its own login page. The accent
is teal (`#14b8a6`). A 390 px phone viewport is a first-class target.

| Path | What |
|---|---|
| `htdocs/luci-static/apex/cascade.css` | design tokens (`--ax-*`) and the styling for the luci-base components, committed as is (`LUCI_MINIFY_CSS:=0`) |
| `htdocs/luci-static/apex/apex.js` | sidebar navigation from the LuCI `ui.menu` API, mobile drawer, theme toggle |
| `htdocs/luci-static/apex/login.css`, `login.js` | login page styles (`--al-*`) and the show-password toggle |
| `htdocs/luci-static/apex/fonts/` | self-hosted Inter and JetBrains Mono (SIL OFL 1.1) |
| `ucode/template/themes/apex/` | `header.ut`, `footer.ut` and the login page `sysauth.ut` |
| `root/etc/uci-defaults/70-luci-theme-apex` | registers the theme in `/etc/config/luci` |

The sidebar nav and the system, modem, memory and storage widgets use class names with the `ax-` prefix.
The widgets only render if the matching status views emit those classes.

## Build

Put the repository in a feed, or copy `luci-theme-apex/` into `package/` of an OpenWrt 25.12 tree, then:

```
make menuconfig            # LuCI > Themes > luci-theme-apex
make package/luci-theme-apex/compile
```

Install the `.apk` with `apk add --allow-untrusted`, then pick **Apex** under System > System > Language and Style.

## Licence

GPL-2.0-only, see `LICENSE`. The bundled fonts are SIL OFL 1.1, see `THIRD-PARTY-NOTICES.md`.
