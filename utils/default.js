const resolve = require('resolve');
const path = require('path');
const fs = require('fs');
const moduleFormats = require('js-module-formats');
/**
 * @argument 解析模块全路径
 * @param {*} importee 被import模块
 * @param {*} importer import模块
 */
exports.resolveId = function (importee, importer){
    if ( /\0/.test( importee ) ) return null; 
    if ( !importer ) return null;
    return new Promise( (res,rej) => {
        const parts = importee.split( /[\/\\]/ );
        let id = parts;
        if ( id[0] === '.' ) {
            id = path.resolve( importer, '..', importee );
            res(id);
        }
        resolve(
            importee,
            Object.assign({
                basedir: path.dirname( importer ),
                packageFilter ( pkg ) {
                    if ( pkg[ 'module' ] ) {
                        pkg[ 'main' ] = pkg[ 'module' ];
                    } else if ( pkg[ 'jsnext:main' ] ) {
                        pkg[ 'main' ] = pkg[ 'jsnext:main' ];
                    }
                    return pkg;
                }
            }),
            ( err, resolved ) => {
                res( resolved );
                if ( !err ) {
                    if ( resolved && fs.existsSync( resolved ) ) {
                        resolved = fs.realpathSync( resolved );
                        fs.readFile( resolved, 'utf-8', ( err, code ) => {
                            if ( err ) {
                                reject( err );
                            } else {
                                const valid = moduleFormats.detect( code );
                                //console.log('代码模式',valid);
                            }
                        });
                    }
                }
            }
        );
    }).catch((error) => {
        throw new Error('resolveId error',error);
    });
}