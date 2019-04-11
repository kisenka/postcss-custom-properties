import valueParser from 'postcss-values-parser';

import transformValueAST from './transform-value-ast';
import { isVarFunction } from './utils';

export default (root, customProperties) => {
	root.walkFunctionNodes(child => {
		if (!isVarFunction(child)) {
			return;
		}

		const [varNode, , ...fallbacks] = child.nodes.slice(1, -1);
		const hasFallback = fallbacks.length > 0;
		const { value: varName } = varNode;

		if (hasFallback || !(varName in customProperties)) {
			return;
		}

		/**
		 * We need to calculate fallback value for each var() separately
		 */
		const clonedChild = valueParser(child.toString()).parse();
		const fallbackValue = transformValueAST(clonedChild, customProperties);

		const closingBracket = child.last;
		child.insertBefore(closingBracket, `, ${fallbackValue}`);
	});

	return root;
}
