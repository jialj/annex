const fs = require('fs');
module.exports = function load( id ){
   return new Promise((resolve,reject) => {
        fs.readFile(id, 'utf-8',(err,code) =>{
            resolve(code);
        });
   })
}