import valueParser from 'postcss-values-parser';
import transformValueAST from './transform-value-ast';
import { isRuleIgnored } from './is-ignored';
import fallbackFuncs from './fallback-var-funcs';

// transform custom pseudo selectors with custom selectors
export default (root, customProperties, opts) => {
	// walk decls that can be transformed
	root.walkDecls(decl => {
		if (isTransformableDecl(decl) && !isRuleIgnored(decl)) {
			const originalValue = decl.value;
			const originalValueAST = valueParser(originalValue).parse();

			/**
			 * We can't just clone originValue node, because cloned node doesn't contain
			 * `before` and `after` properties, so original & cloned nodes will differ.
			 * This feature was added in postcss-value-parser@3, after upgrading it
			 * originalValue node can be cloned.
			 * @see https://codesandbox.io/s/1zn818x50l?expanddevtools=1&fontsize=14
			 * @see https://github.com/TrySound/postcss-value-parser/releases/tag/v3.0.0
			 */
			const valueAST = opts.fallback
				? valueParser(originalValue).parse()
				: originalValueAST;

			const value = String(transformValueAST(valueAST, customProperties));

			// conditionally transform values that have changed
			if (value !== originalValue) {
				if (opts.preserve) {
					decl.cloneBefore({ value });

					if (opts.fallback) {
						decl.value = String(fallbackFuncs(originalValueAST, customProperties));
					}
				} else {
					decl.value = value;
				}
			}
		}
	});
};

// match custom properties
const customPropertyRegExp = /^--[A-z][\w-]*$/;

// match custom property inclusions
const customPropertiesRegExp = /(^|[^\w-])var\([\W\w]+\)/;

// whether the declaration should be potentially transformed
const isTransformableDecl = decl => !customPropertyRegExp.test(decl.prop) && customPropertiesRegExp.test(decl.value);
