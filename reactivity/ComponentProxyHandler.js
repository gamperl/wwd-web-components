import Expression from './Expression.js';
let nextId = 0;
export default class ComponentProxyHandler {
	constructor() {
		this.calledBy = new Map();
		this.uid = nextId++;
	}
	has(target, key) {
		return Reflect.has(target, key);
	}
	get(target, key, receiver) {
		if (Expression.active() instanceof Expression && typeof key === 'string') {
			if (this.calledBy.has(key)) {
				this.calledBy.get(key).add(Expression.active());
			} else {
				this.calledBy.set(key, new Set([Expression.active()]));
			}
			Expression.active().dependsOn.add(`${this.uid}.${key}`);
		}
		return Reflect.get(target, key, receiver);
	}
	set(target, key, value, receiver) {
		if (this.calledBy.has(key)) {
			this.calledBy.get(key).forEach(expression => {
				if (expression.dependsOn.has(`${this.uid}.${key}`)) {
					expression.update();
				}
			});
		}
		return Reflect.set(target, key, value, receiver);
	}
	apply(target, self, args) {
		return Reflect.apply(target, self, args);
	}
}
