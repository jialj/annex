
const Node = require('../Node.js');
module.exports = class ExportNamedDeclaration extends Node{
    render( code ){
        if (this.declaration) {
			code.remove(this.start, this.declaration.start);
			//this.declaration.render(code, es);
		} else {
			code.remove(this.start,this.end);
		}
    }
}