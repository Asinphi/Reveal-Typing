// Do not remove this import. If you do Vite will think your styles are dead
// code and not include them in the build output.
import {ModuleData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/packages.mjs";

import { moduleId } from "./constants";
import "../styles/style.scss";
import PreviewBox from "./apps/typing-preview";

declare global {
    interface LenientGlobalVariableTypes {
        game: never;
    }
}

export class RevealTyping {
    static ID = moduleId;
    static module: Game.ModuleData<ModuleData>;
    static previewBox: PreviewBox;
    static packetDebounce: number = 100;

    static TEMPLATES = {
        PREVIEW_BOX: `modules/${this.ID}/templates/preview-box.hbs`,
    }

    static log(force: boolean | any, ...args: any) {
        // @ts-ignore
        const shouldLog = force == true || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);
        if (shouldLog)
            console.log(this.ID, '|', force,  ...args);
    }
}

Hooks.once('devModeReady', ({ registerPackageDebugFlag }: any) => {
    registerPackageDebugFlag(RevealTyping.ID);
});

Hooks.once("init", () => {
    RevealTyping.module = (game as Game).modules.get(moduleId);
    RevealTyping.previewBox = new PreviewBox();
    // @ts-ignore
    globalThis.RevealTyping = RevealTyping;
    console.log(`Initializing ${moduleId}`);

    // Setup settings
    game.settings.register(RevealTyping.ID, "packetDebounce", {
        name: game.i18n.localize("reveal-typing.settings.packet-debounce.name"),
        hint: game.i18n.localize("reveal-typing.settings.packet-debounce.hint"),
        scope: "world",
        config: true,
        type: Number,
        default: 100,
        range: {
            min: 0,
            max: 1000,
            step: 10,
        },
        onChange: (newValue: number) => { // Fires on all clients for world scoped settings
            RevealTyping.packetDebounce = newValue;
            RevealTyping.log("Changed the packetDebounce value to", newValue);
        }
    });

    const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);

    game.settings.register(RevealTyping.ID, "hiddenUserLevel", {
        name: game.i18n.localize("reveal-typing.settings.hidden-user-level.name"),
        hint: game.i18n.localize("reveal-typing.settings.hidden-user-level.hint"),
        scope: "world",
        config: true,
        type: String,
        choices: {
            ...Object.fromEntries(Object.entries(CONST.USER_ROLE_NAMES).slice(1)), // Remove the None role
            "5": game.i18n.localize("reveal-typing.settings.previewer-user-level.hide-nobody") } as never,
        default: "4", // Gamemaster
        onChange: debouncedReload,
    });

    game.settings.register(RevealTyping.ID, "previewerUserLevel", {
        name: game.i18n.localize("reveal-typing.settings.previewer-user-level.name"),
        hint: game.i18n.localize("reveal-typing.settings.previewer-user-level.hint"),
        scope: "world",
        config: true,
        type: String,
        choices: CONST.USER_ROLE_NAMES as never,
        default: "4", // Gamemaster
        onChange: debouncedReload,
    });

    RevealTyping.packetDebounce = game.settings.get(RevealTyping.ID, "packetDebounce") as number;
});
