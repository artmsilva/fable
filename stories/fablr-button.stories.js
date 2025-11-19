import { html } from 'lit';
import '../components/fablr-button.js';

export default {
    title: 'Fablr Button',
    component: 'fablr-button',
};

export const Primary = () => html`<fablr-button label="Primary Button"></fablr-button>`;
export const Disabled = () => html`<fablr-button label="Disabled" ?disabled=${true}></fablr-button>`;