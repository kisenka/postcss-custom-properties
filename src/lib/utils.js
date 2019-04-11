// match var() functions
const varRegExp = /^var$/i;

// whether the node is a var() function
export const isVarFunction = node =>
	node.type === 'func' &&
	varRegExp.test(node.value) &&
	Object(node.nodes).length > 0;
