const fs = require('fs').promises;
const path = require('path');
const {parseStringJS}=require('../../../src/development/turbodoc');
 


const tests = [
    {
      title:'Tester',
      str:`  
      /**
       *   docblock method1
       **/
      function method1(x,y){

      }     
      `
    },
    {
      title:'All',
      str:` 
    // definitions 
     class A{}
     static class B{}
     function C(){}
     static function D(){}
     async function E(){}
     static async function F(){}
     Function.prototype.G = function(args) { }
     Array.prototype.H = function(args) { }
     class I {
      a(){}
      static b(){}
      async c(){}
      static async d(){}
    
    }
    class J{ 
      a = ()=>{}
      b =async ()=>{}
      static c =  ()=>{}
      static d = async ()=>{}
    }
  
  
    class L{ 
      a = class{  }
      static b = class{  }
   }
   class M extends myBaseClass{}
   static class N extends myBaseClass{}
   const O = class extends myBaseClass{}
  
  
  class P { 
    a = class extends myBaseClass{}
    static b = class extends myBaseClass{} 
  }
  
  
    // assignations
     var a; 
     const b=1;
     let c="2";
     var d='3'+
     '3';
     var e = class{}
     var f = static class{}
     var g = static class extends () {}
     var h = class extends () {}
     var i = function(){}
     var j = async function(){}
     var k = static function(){}
     var l = async static function(){}
     var m = ()=>{}
     var n = async ()=>{}
     var o = static ()=>{}
     var p = async static ()=>{}
      `
    }, 
  ]; 
   let testIndex = process.argv[2]||0;
  
   var test = tests[testIndex];
   console.log('TESTING:',testIndex, test.title); 
  var r = parseStringJS((test.str||""),{markers:{
    'todo':'@todo',
    'doc':'@doc'
  }}).output;
  r = JSON.stringify(r,null,2)
  console.log(r);
     