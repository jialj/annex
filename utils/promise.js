/**
 * @argument 顺序传入arr中的参数，依次执行fn方法
 * @param {*} arr 
 * @param {*} fn 
 */
exports.mapSequence = function ( arr, fn){
    let results = [],
        promise = Promise.resolve();

    function next( one,i ){
        return Promise.resolve( fn(one).then(val => (results[i] = val)) );
    }
    for(let  i=0,j=arr.length; i<j; i++){
        promise = promise.then( () => {
            return next(arr[i],i)
        });
    }
    return promise.then( () => results );
}