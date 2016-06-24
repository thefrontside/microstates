import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

// describe("Object Microstate", function() {
//   let TodoList;
//   let list;
//   beforeEach(function() {
//     TodoList = MicroState.extend({
//       constructor(name = '', items = [])  {
//         return {name, items};
//       },

//       get upperName() {
//         return this.name.toUpperCase();
//       }

//     });
//     list = new TodoList("groceries", ['apples', 'milk']);
//   });
//   it("constructs an instance of the class", function() {
//     expect(list).to.be.instanceOf(TodoList);
//   });
//   it("copies any values returned in the constructor", function() {
//     expect(list.name).to.equal('groceries');
//     expect(list.items).to.deep.equal(['apples', 'milk']);
//   });

//   it("has computed properties available", function() {
//     expect(list.upperName).to.equal('GROCERIES');
//   });

//   describe("replacing the state", function() {


//   });

// });
