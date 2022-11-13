import {RevealTyping} from "../module.js";

export default class PreviewBox extends Application {
    static messages: Record<string, string> = {};

    static override get defaultOptions() {
        const defaults = super.defaultOptions;
        defaults.template = RevealTyping.TEMPLATES.PREVIEW_BOX;
        defaults.id = "typing-preview";
        defaults.title = "Typing Preview";
        defaults.width = 1000;
        defaults.height = 300;
        defaults.resizable = true;
        defaults.classes = ["typing-preview"];
        return defaults;
    }

    override getData(options: any): any {
        return {
            players: game.users.players
                .filter((u) => u.active)
                .map(u => {return {name: u.name, color: u.color, message: PreviewBox.messages[u.name]}}),
        };
    }
}

let lastPacketSend = 0;
let lastKeyPress = 0;

function emitTypingPreview(message: string) {
    game.socket?.emit("module.reveal-typing", {
        userName: game.user.name,
        message: message,
    });
    lastPacketSend = Date.now()
    //RevealTyping.log(game.user.name, message); // Something wrong on client-side, not printing the user name
}

const onKeyUp = (event: KeyboardEvent) => {
    const message = (event.target as HTMLInputElement).value;
    const keyPressTime = Date.now();
    lastKeyPress = keyPressTime;
    if (Date.now() - lastPacketSend > RevealTyping.packetDebounce) {
        emitTypingPreview(message);
    } else {
        setTimeout(() => {
            if (lastKeyPress === keyPressTime) // This was the last key pressed
                emitTypingPreview(message);
        }, RevealTyping.packetDebounce);
    }
}

Hooks.once('ready', () => {
    if (!game.user.isGM) {
        // The ready hook is called after the first renderChatLog
        document.getElementById("chat-message")?.addEventListener("keyup", onKeyUp);
        Hooks.on("renderChatLog", (chatLog: ChatLog, html: JQuery) => { // For the popped out chatlog
            html.find("#chat-message")[0].addEventListener("keyup", onKeyUp);
        });
    } else
        game.socket.on("module.reveal-typing", ({userName, message}) => {
            PreviewBox.messages[userName] = message;
            // @ts-ignore
            if (!globalThis.RevealTyping.previewBox.rendered) return; // globalThis.RevealTyping is different from RevealTyping
            RevealTyping.previewBox.element.find(`.typing-preview__content[title=${userName}]`).text(message);
        });
});
