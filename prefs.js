/*
 * This code is heavily inspired by and based on the amazing work of christopher-l 
 * (https://github.com/christopher-l) and his project space-bar 
 * (https://github.com/christopher-l/space-bar).
 */

const {Adw, Gdk, Gtk, GLib} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = imports.misc.extensionUtils.getCurrentExtension();

function addFilePicker({
                           group,
                           key,
                           title,
                           settings,
                       }) {
    const row = new Adw.ActionRow({
        title,
        activatable: true,
    });
    group.add(row);
    const filenameLabel = new Gtk.Label({
        label: GLib.basename(settings.get_string(key)),
        valign: Gtk.Align.CENTER,
    });
    row.add_suffix(filenameLabel);

    const filter = new Gtk.FileFilter();
    filter.add_pixbuf_formats();

    let fileChooser = new Gtk.FileChooserNative({
        title: 'Select an Image for the overlay.',
        filter,
        modal: true,
    });
    fileChooser.connect('response', (dlg, response) => {
        if (response !== Gtk.ResponseType.ACCEPT) return;
        settings.set_string(fc_key, dlg.get_file().get_path());
        fc_label.label = GLib.basename(settings.get_string(fc_key));
    });

    row.connect('activated', () => {
        fc_key = key;
        fc_label = filenameLabel;
        fileChooser.transient_for = row.get_root();
        fileChooser.show();
    });
}

function addShortcutPicker({
                                 window,
                                 group,
                                 key,
                                 title,
                                 settings,
                             }) {
    const row = new Adw.ActionRow({
        title,
        activatable: true,
    });
    group.add(row);
    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: settings.get_strv(key)[0] ?? null,
        valign: Gtk.Align.CENTER,
    });
    row.add_suffix(shortcutLabel);
    const disabledLabel = new Gtk.Label({
        label: 'Disabled',
        css_classes: ['dim-label'],
    });
    row.add_suffix(disabledLabel);
    if (settings.get_strv(key).length > 0) {
        disabledLabel.hide();
    } else {
        shortcutLabel.hide();
    }

    function showDialog() {
        const dialog = new Gtk.Dialog({
            title: 'Set Shortcut',
            modal: true,
            transient_for: window,
            height_request: 120
        });
        const dialogBox = new Gtk.Box({
            margin_start: 15,
            margin_end: 15,
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
        });
        const dialogLabel = new Gtk.Label({
            label: `Enter <b>${title}</b>.`,
            use_markup: true,
            margin_bottom: 15,
        });
        dialogBox.append(dialogLabel);
        const dialogDimLabel = new Gtk.Label({
            label: 'Use <b>Esc</b> to cancel or <b>Backspace</b> to disable this shortcut.',
            use_markup: true,
        });
        dialogBox.append(dialogDimLabel);
        const keyController = new Gtk.EventControllerKey({
            propagation_phase: Gtk.PropagationPhase.CAPTURE,
        });
        dialog.add_controller(keyController);
        keyController.connect('key-pressed', (keyController, accelerator_key, keycode, modifier) => {
            let accelerator = Gtk.accelerator_name(accelerator_key, modifier);
            if (!Gtk.accelerator_valid(accelerator_key, modifier)) accelerator = null;
            if (accelerator) {
                if (accelerator_key === Gdk.KEY_BackSpace && !modifier) {
                    shortcutLabel.hide();
                    disabledLabel.show();
                    settings.set_strv(key, []);
                } else if (accelerator_key !== Gdk.KEY_Escape || modifier) {
                    shortcutLabel.accelerator = accelerator;
                    shortcutLabel.show();
                    disabledLabel.hide();
                    settings.set_strv(key, [accelerator]);
                }
                dialog.close();
            }
        });
        dialog.set_child(dialogBox);
        dialog.show();
    }
    row.connect('activated', () => showDialog());
}

function init() {
}

function fillPreferencesWindow(window) {
    let page = new Adw.PreferencesPage();
    page.set_title('Settings');
    page.window = window;

    let settings = ExtensionUtils.getSettings();

    for (let id = 0; id < 10; id++) {
        let group = new Adw.PreferencesGroup();
        group.set_description(`Overlay No. ${id + 1}`);
        page.add(group);
        addShortcutPicker({
            settings: settings,
            window: window,
            group,
            key: `overlay-${id}`,
            title: "Shortcut to toggle the overlay",
        });
        addFilePicker({
            settings: settings,
            group,
            key: `file-${id}`,
            title: "Picture to use as overlay",
        })
    }
    window.add(page);
}