
const Node = require('../Node.js');
module.exports = class ImportDeclaration extends Node{
    render( code ){
        code.remove(this.start, this.next || this.end);
    }
}