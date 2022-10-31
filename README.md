# Reveal Typing

A [Foundry VTT](https://foundryvtt.com) module that allows GMs to open a preview window that shows what all the players are typing before they send it. This can be helpful if you're running a text-based game. It can speed up things by allowing you to get a head start on your response while you're waiting for players to finish up. It also helps you know whether your players are ready for you to time skip and move to the next scene or if they still have something they want to say.

## Features

- Pretty preview window that displays all your players' chatboxes
- Customizable time interval between updates to the preview window. Lower values mean it gets updated more frequently but it increases internet traffic.

## Usage

You can set a macro to toggle the preview window by setting the macro type to `script` and putting the following code inside:
```js
const previewBox = globalThis.RevealTyping.previewBox;
if (!previewBox.rendered)
  previewBox.render(true);
else
  previewBox.close();
```
