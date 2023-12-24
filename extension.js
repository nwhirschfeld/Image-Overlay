import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Meta from 'gi://Meta';
import St from 'gi://St';
import Shell from 'gi://Shell';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class ImageOverlayExtension extends Extension {

    constructor(metadata) {
        super(metadata);

        console.debug(`constructing ${this.metadata.name}`);
        this.overlay = null;
this.settings = null;
this.shortcuts = [];
this.hidden = true;
    }

setStyle(image) {
    let {
        0: width,
        1: height
    } = global.display.get_size();
    let border_size =
        width > 2560 ? 80 :
            width >= 1280 ? 40 : 20;
    width -= border_size * 2;
    height -= border_size * 2;
    this.overlay.set_style(
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

showOverlay() {
    Main.layoutManager.addChrome(this.overlay, {
        affectsInputRegion: false
    });
}

hideOverlay() {
    if (!this.overlay) {
      return;
    }

    Main.layoutManager.removeChrome(this.overlay);
    this.overlay.destroy();
    this.overlay = null;
}

click(image) {
console.debug(`${this.metadata.name} clicked`)
    this.hidden = !this.hidden;
    if (this.hidden) {
        this.hideOverlay();
    } else {
        this.overlay = new St.Widget();
        this.setStyle(image);
        this.showOverlay();
    }
}

registerShortcut(name, callback) {
    Main.wm.addKeybinding(
        name,
        this.settings,
        Meta.KeyBindingFlags.NONE,
        Shell.ActionMode.ALL,
        callback
    );

    this.shortcuts.push(name);
}

init() {
}

enable() {
    console.debug(`enabling ${this.metadata.name}`);
    this.settings = this.getSettings();
    for (let id = 0; id < 10; id++) {
        this.registerShortcut(`overlay-${id}`, () => {
            this.click(this.settings.get_string(`file-${id}`));
        });
    }
}

disable() {
    console.debug(`disabling ${this.metadata.name}`);
    this.hideOverlay();
    this.shortcuts.forEach((id) => Main.wm.removeKeybinding(id))
    this.shortcuts = [];
    this.settings = null;
}

}
