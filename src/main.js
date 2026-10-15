import { html, render } from './ui/lib.js';
import { App } from './ui/app.js';

render(html`<${App} />`, document.getElementById('root'));
