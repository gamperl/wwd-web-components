export default function createComponent(tagName, templateSelector) {
	const HWElement = class extends HTMLElement {
		constructor() {
			super();
			const template = document.querySelector(templateSelector);
			const stampedTemplate = document.importNode(template.content, true);
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.appendChild(stampedTemplate);
		}
	};
	customElements.define(tagName, HWElement);
}