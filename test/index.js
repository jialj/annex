const def = require( '../utils/default') ;
const Bundle = require('../src/bundle');
const expect = require('chai').expect;
const load = require('../utils/load');

describe('解析模块路径', function() {
  it('解析成功', function() {
    expect(def.resolveId('resolve','/Users/jialinjing/360/github/overlay/utils/default.js')).to.be.a('Promise');
    expect(def.resolveId('./module.js','/Users/jialinjing/360/github/overlay/src/bundle.js')).to.be.a('Promise');
  });
  
  //load加载文件
  it('加载完成',function() {
    expect(load('/Users/jialinjing/360/github/overlay/utils/default.js')).to.be.a('Promise');
  })

  it('打包成功',function(){
      let bundle = new Bundle();
      bundle.bundle('/Users/jialinjing/360/github/overlay/fortest/index.js').then(()=>{
          bundle.render();
      })
  })
});