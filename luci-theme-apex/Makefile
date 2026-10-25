# SPDX-License-Identifier: GPL-2.0-only
# Copyright (C) 2026 Pr0Luci
#
# luci-theme-apex: LuCI 25.12 theme for the Arcadyan AW1000.
# Dense, technical dark theme: ucode page templates (ucode/template/themes/apex/),
# design tokens in cascade.css, sidebar and drawer in apex.js, a separate login
# page (sysauth.ut + login.css/login.js) with self-hosted Inter and JetBrains
# Mono (SIL OFL 1.1, see THIRD-PARTY-NOTICES.md).

include $(TOPDIR)/rules.mk

LUCI_TITLE:=LuCI Theme - Apex
LUCI_DEPENDS:=+luci-base
LUCI_DESCRIPTION:=Mobile-first dark/light LuCI theme for the Arcadyan AW1000.

# cascade.css is committed minified. csstidy --template=highest randomly drops
# @font-face rules, so minifying it again would only lose things.
LUCI_MINIFY_CSS:=0

PKG_NAME:=luci-theme-apex
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_LICENSE:=GPL-2.0-only OFL-1.1
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=Pr0Luci <Pr0Luci@users.noreply.github.com>

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
$(eval $(call BuildPackage,luci-theme-apex))
