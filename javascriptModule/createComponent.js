export default function createComponent(tagName, content) {
	const HWElement = class extends HTMLElement {
		constructor() {
			super();
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = content;
		}
	};
	customElements.define(tagName, HWElement);
}