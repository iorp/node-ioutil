const {httpRequest}=require('../../../src/common/network');



const api = 'http://localhost/Portfolio/api/ioserver/test';

 
(async ()=>{
    const result = await httpRequest(api, { key0: 'value0', key1: 'value1'  }, 'POST');
    console.log(result)
})();


 // result will be the parsed JSON response or an error object.