/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const { Meta, St, Shell } = imports.gi;

let overlay = null;
let settings = null;
let shortcuts = [];

let hidden = true;

function setStyle(image) {
    let {
        0: width,
        1: height
    } = global.display.get_size();
    let border_size =
        width > 2560 ? 80 :
            width >= 1280 ? 40 : 20;
    width -= border_size * 2;
    height -= border_size * 2;
    overlay.set_style(
        `background-color: transparent;
        background: url(${image});
        background-size:     contain;
        background-repeat:   no-repeat;
        background-position: center center;
        margin: ${border_size}px;
        width: ${width}px;
        height: ${height}px;`
    );
}

function showOverlay() {
    Main.layoutManager.addChrome(overlay, {
        affectsInputRegion: false
    });
}

function hideOverlay() {
    Main.layoutManager.removeChrome(overlay);
    overlay.destroy();
    overlay = null;
}

function click(image) {
    hidden = !hidden;
    if (hidden) {
        hideOverlay();
    } else {
        overlay = new St.Widget();
        setStyle(image);
        showOverlay();
    }
}

function registerShortcut(name, callback) {
    Main.wm.addKeybinding(
        name,
        settings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode.ALL,
        callback
    );

    shortcuts.push(name)
}

function init() {
}

function enable() {
    settings = ExtensionUtils.getSettings();
    for (let id = 0; id < 10; id++) {
        registerShortcut(`overlay-${id}`, function () {
            click(settings.get_string(`file-${id}`));
        });
    }
}

function disable() {
    hideOverlay();
    shortcuts.forEach((id) => Main.wm.removeKeybinding(id))
    shortcuts = []
}