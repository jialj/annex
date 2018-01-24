const path = require( 'path' );

const Module = require('./module.js');
const def = require('../utils/default.js') ;
const load = require('../utils/load.js');
const promise = require('../utils/promise.js');
const MagicString = require( 'magic-string' );
module.exports =  class Bundle{
    constructor( inputOpts ){
        this.id = '';
        this.modules = [];
        this.cacheModules = new Map();
        this.resolvedIds = new Map();
        this.moduleById = new Map();
        this.orderedModules = [];
        this.entryModule = {};
    }
    bundle( entry ){
        return this.beginLoad( entry ).then(()=>{
            this.link();
            this.entryModule = this.modules[0];
            this.orderedModules = this.orderModules( this.entryModule );
            console.log('---模块分析结束---');
            return true;
        })
    }
    render(){
        let bundle = new MagicString.Bundle();
        this.orderedModules.forEach( (module,index) => {
            bundle.addSource( module.render() );
        })
    }
    beginLoad( entry ){
        this.id = entry;
        return load( this.id ).then( ( code ) => {
            const opts = {
                ast: '',
            }
            return this.featchModule( this.id , undefined );
        })
    }
    /**
     * @argument 抓取单个模块
     * @param {*} id模块全路径
     * @param {*} importer 引入者
     */
    featchModule(id , importer) {
        return load( id ).then( ( code ) => {
            console.log('id--'+id);
            const opts = {
                id: id,
                code: code,
                ast: '',
                importer: importer,
                resolvedIds:{},
                bundle: this
            }
            let module = new Module( opts );
            // if( this.cacheModules.get( module.id ) === undefined ){
            //     return;
            // }
            this.modules.push( module );
            this.moduleById.set(id, module);

            return this.fetchAllDependencies(module).then(() => {
                return module;
            });
        })
    }
    /**
     * @argument 抓取一个模块的所有依赖
     * @param {*} module 
     */
    fetchAllDependencies( module ){
        return promise.mapSequence( module.sources,( source ) => {
            return def.resolveId(source, module.id).then( ( resolvedId ) =>{
                module.resolvedIds[source] = resolvedId;
                return this.featchModule( resolvedId,module.id );
            })
        })
    }
    orderModules( entryModule ){
        let orderedModules = [];
        let currentModule;
        let cycle = (module) => {
            module.dependencies.forEach(cycle);
            orderedModules.push( module );
        }
        cycle( entryModule );
        currentModule = entryModule;
        return orderedModules;
    }
    link( module ){
        this.modules.forEach(module => {
			module.linkDependencies();
		});
    }
}