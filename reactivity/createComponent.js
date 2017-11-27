import ComponentProxyHandler from './ComponentProxyHandler.js'
import Expression from './Expression.js';
export default function createComponent(tagName, templateSelector, componentFactory) {
	let Base = class {
		constructor() {
			let proxyHandler = new ComponentProxyHandler();
			return new Proxy(this, proxyHandler);
		}
	};
	let ComponentClass = componentFactory(Base);
	const ComponentElement = class extends HTMLElement {
		constructor() {
			super();
			const scope = new ComponentClass();
			const template = document.querySelector(templateSelector);
			const stampedTemplate = document.importNode(template.content, true);
			this.compileContentExpressions(scope, template);
			this.compileAttributeExpressions(scope, template);
			this.compileEventListeners(scope, template);
			const shadowRoot = this.attachShadow({ mode: 'open' });
			shadowRoot.appendChild(stampedTemplate);
		}
		compileContentExpressions(scope, template) {
			const xPath = '//text()[contains(.,"${") and contains(substring-after(.,"${"),"}")]';
			for (let textNode of this.evaluateXPaht(template, xPath)) {
				const callable = new Function('', `with (this) return \`${textNode.nodeValue}\`;`);
				const observer = value => { textNode.nodeValue = value; };
				new Expression(scope, callable, observer);
			}
		}
		compileAttributeExpressions(scope, template) {
			const xPath = '//@*[starts-with(name(), ":")]';
			for (let attribute of this.evaluateXPaht(template, xPath)) {
				const callable = new Function('', `with (this) return ${attribute.value};`);
				const name = attribute.name.substr(1);
				const element = attribute.ownerElement;
				const observer = value => { element.setAttribute(name, value); };
				new Expression(scope, callable, observer);
				element.removeAttribute(attribute.name);
			}
		}
		compileEventListeners(scope, template) {
			const xPath = '//@*[starts-with(name(), "@")]';
			for (let attribute of this.evaluateXPaht(template, xPath)) {
				const callable = new Function('$event', `with (this) { ${attribute.value}; }`);
				attribute.ownerElement.addEventListener(attribute.name.substr(1), event => callable.call(scope, event));
				attribute.ownerElement.removeAttribute(attribute.name);
			}
		}
		*evaluateXPaht(template, xPath) {
			const xPathResult = document.evaluate(
				xPath, template.firstElementChild, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null
			);
			for (let index = 0; index < xPathResult.snapshotLength; index += 1) {
				yield xPathResult.snapshotItem(index);
			}
		}
	};
	customElements.define(tagName, ComponentElement);
}
