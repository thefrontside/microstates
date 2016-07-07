import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import { MicroState, StringState, BooleanState } from 'microstates';

describe("Object Microstate", function() {

  describe("TodoList", function(){
    let TodoList;
    let list;
    beforeEach(function() {
      TodoList = MicroState.extend('TodoList', {
      constructor(name = '', items = [])  {
        return {name, items};
      },

      get upperName() {
        return this.name.toUpperCase();
      },

      transitions: {
        rename(current, name) {
          return new TodoList(name, this.items);
        },

        makePartyList() {
          return {
            name: 'party list',
            items: ['wine', 'cheese']
          };
        }
      }
      
      });
      list = new TodoList("groceries", ['apples', 'milk']);
    });
    it("constructs an instance of the class", function() {
      expect(list).to.be.instanceOf(TodoList);
    });
    it("copies any values returned in the constructor", function() {
      expect(list.name).to.equal('groceries');
      expect(list.items).to.deep.equal(['apples', 'milk']);
    });

    it("has computed properties available", function() {
      expect(list.upperName).to.equal('GROCERIES');
    });

    describe("replacing the state", function() {
      let updated;

      beforeEach(function(){
        updated = list.replace('more groceries', ['watermellon', 'apples', 'milk']);
      });

      it("will become new values", function(){
        expect(updated).to.be.instanceOf(TodoList);
        expect(updated.name).to.equal('more groceries');
        expect(updated.items).to.deep.equal(['watermellon', 'apples', 'milk']);
      });
    });

    describe("replacing state from a transition", function(){
      let updated;

      beforeEach(function(){
        updated = list.rename("tomorrow's groceries");
      });

      it("will receive a new TodoList with new name", function(){
        expect(updated).to.be.instanceOf(TodoList);
        expect(updated.name).to.equal("tomorrow's groceries");
        expect(updated.items).to.deep.equal(['apples', 'milk']);
      });
    });

    describe("replacing state from transition via merge", function(){
      let updated;

      beforeEach(function(){
        updated = list.makePartyList();
      });

      it('will merge values and return new TodoList microstate', function(){
        expect(updated).to.be.instanceOf(TodoList);
        expect(updated.name).to.equal("party list");
        expect(updated.items).to.deep.equal(['wine', 'cheese']);
      });
    });

    describe("inheritance", function(){
      let WorkTodoList;
      let workList;
      beforeEach(function(){
        WorkTodoList = TodoList.extend('WorkTodoList', {
          constructor(name = '', items = [])  {
            return {name, items};
          },

          get upperName() {
            return `☭ ${this.name.toUpperCase()}`;
          },

          due: 'today',

          transitions: {
            changeDue(current, due) {
              return {
                due: due
              }
            }
          }
        });
        workList = new WorkTodoList('day job', ['write code', 'talk to client']);
      });
      it("maintains prototype chain", function(){
        expect(workList).to.be.instanceOf(TodoList);
        expect(workList).to.be.instanceOf(WorkTodoList);
        expect(workList.upperName).to.equal('☭ DAY JOB');
      });
      it("inherits transitions from ancenstor", function(){
        expect(workList.changeDue).to.be.a('function');
        expect(workList.rename).to.be.a('function');
        expect(workList.makePartyList).to.be.a('function');
      });
      it("transition returns instance of current class", function(){
        let tomorrowsList = workList.changeDue('tomorrow');
        expect(tomorrowsList.due).to.equal('tomorrow');
        expect(tomorrowsList).to.be.instanceOf(WorkTodoList);
      });
    });
  });

  describe("TodoItem", function(){
    let TodoItem;

    beforeEach(function(){
      TodoItem = MicroState.extend('TodoItem', {
        constructor(name = '') {
          return { 
            name,
            isComplete: false
          };
        },
        name: StringState,
        isComplete: BooleanState
      });
    })

    it("can be instantiated with sub states", function(){
      let item = new TodoItem();

      expect(item.name.valueOf()).to.be.empty;
      expect(item.isComplete.valueOf()).to.be.false;

    });

  });

});
