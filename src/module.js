const acorn = require('acorn');
const MagicString = require('magic-string');
const extractNames = require('../ast/utils.js');
module.exports = class Module{
    constructor( opts ){
        this.id = opts.id;
        this.sources = []; //所有import，资源位置
        this.resolvedIds = Object.create(null); //import 和具体资源位置的对应
        this.dependencies = []; //所有依赖的Module实例
        this.bundle = opts.bundle;
        this.importer = opts.importer;
        this.code = opts.code;
        this.imports = Object.create(null);
        this.exports = Object.create(null);
        this.reexports = Object.create(null);
        this.exportAllSources = [];
        
        this.analyse();
        this.magicString = new MagicString(this.code, {
			filename: null,
			indentExclusionRanges: []
        });
    }

    analyse (){
        this.ast = acorn.parse(this.code, {
			ecmaVersion: 8,
			sourceType: 'module',
			preserveParens: false
        })
        for (const node of this.ast.body) {
			if( node.type === 'ImportDeclaration' ){
				this.addImport(node);
			} else if ( (node.type === "ExportDefaultDeclaration") || (node.type === "ExportNamedDeclaration") || (node.type === "ExportAllDeclaration") ){
				this.addExport(node);
			}
		}
    }
    addImport ( node ){
		const source = node.source.value;
        if (!~this.sources.indexOf(source)) this.sources.push(source);
        node.specifiers.forEach(specifier => {
            const localName = specifier.local.name;
            if (this.imports[localName]) {
                console.log('重复的import:'+localName);
            }
            const isDefault = specifier.type === "ImportDefaultSpecifier";
            const isNamespace = specifier.type === "ImportNamespaceSpecifier";
            const name = isDefault
                ? 'default'
                : isNamespace ? '*' : specifier.imported.name;
            this.imports[localName] = { source, specifier, name, module: null };
        });
    }

    addExport( node ){
        const source = node.source && node.source.value;
        // export { name } from './other'
        if (source) {
            if (!~this.sources.indexOf(source)) this.sources.push(source);
            if (node.type === "ExportAllDeclaration") {
                this.exportAllSources.push(source);
            } else {
                node.specifiers.forEach(specifier => {
                    const name = specifier.exported.name;
                    if (this.exports[name] || this.reexports[name]) {
                        console.log( 'export重复：'+name );
                    }
                    this.reexports[name] = {
                        start: specifier.start,
                        source,
                        localName: specifier.local.name,
                        module: null 
                    };
                })
            }
        } else if (node.type === "ExportDefaultDeclaration") {
            // export default function foo () {}
            // export default foo;
            // export default 42;
            const identifier = (node.declaration.id && node.declaration.id.name) || node.declaration.name;
            if (this.exports.default) {
                console.log('一个模块只能有一个默认倒出');
            }
            this.exports.default = {
                localName: 'default',
                identifier
            };
        } else if (node.declaration) {
            // export var { foo, bar } = ...
            // export var foo = 42;
            // export var a = 1, b = 2, c = 3;
            // export function foo () {}
            const declaration = node.declaration;

            if (declaration.type === "VariableDeclaration") {
                declaration.declarations.forEach((decl) => {
                    extractNames(decl.id).forEach(localName => {
                        this.exports[localName] = { localName };
                    });
                });
            } else {
                // export function foo () {}
                const localName = declaration.id.name;
                this.exports[localName] = { localName };
            }
        } else {
            // export { foo, bar, baz }
            node.specifiers.forEach(specifier => {
                const localName = specifier.local.name;
                const exportedName = specifier.exported.name;

                if (this.exports[exportedName] || this.reexports[exportedName]) {
                   
                }
                this.exports[exportedName] = { localName };
            });
        }

    }

	linkDependencies () {
		this.sources.forEach(source => {
			const id = this.resolvedIds[source];
			if (id) {
				const module = this.bundle.moduleById.get(id);
				this.dependencies.push(module);
			}
		});
    }
    
    render() {
        const magicString = this.magicString.clone();
        for (const node of this.ast.body) {
            //node.render(magicString);
        }
        return magicString.trim();
    }
}