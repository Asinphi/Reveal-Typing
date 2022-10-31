import {RevealTyping} from "../module.js";

export default class PreviewBox extends Application {
    static messages: Record<string, string> = {};

    static override get defaultOptions() {
        const defaults = super.defaultOptions;
        defaults.template = RevealTyping.TEMPLATES.PREVIEW_BOX;
        defaults.id = "typing-preview";
        defaults.title = "Typing Preview";
        defaults.width = 1000;
        defaults.height = "auto";
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

function emitTypingPreview(message: string) {
    game.socket?.emit("module.reveal-typing", {
        userName: game.user.name,
        message: message,
    });
    lastPacketSend = Date.now()
    //RevealTyping.log(game.user.name, message); // Something wrong on client-side, not printing the user name
}

Hooks.once('ready', () => {
    if (!game.user.isGM)
        document.getElementById("chat-message")?.addEventListener("keyup", (event) => {
            const message = (event.target as HTMLInputElement).value;
            if (Date.now() - lastPacketSend > RevealTyping.packetDebounce) {
                emitTypingPreview(message);
            } else {
                const currentLastPacketSend = lastPacketSend;
                setTimeout(() => {
                    if (lastPacketSend === currentLastPacketSend)
                        emitTypingPreview(message);
                }, RevealTyping.packetDebounce);
            }
        });
    else
        game.socket.on("module.reveal-typing", ({userName, message}) => {
            PreviewBox.messages[userName] = message;
            // @ts-ignore
            if (!globalThis.RevealTyping.previewBox.rendered) return; // globalThis.RevealTyping is different from RevealTyping
            document.querySelector(`.typing-preview__content[title=${userName}]`).innerHTML = message;
        });
});