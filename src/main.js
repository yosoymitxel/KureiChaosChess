import { html, render } from './ui/lib.js';
import { App } from './ui/app.js';
import { startGamepad } from './ui/gamepad.js';

render(html`<${App} />`, document.getElementById('root'));
startGamepad();
