import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import List from '../src/list';

describe("List", function() {
  let list;
  beforeEach(function() {
    list = new List([1,2,3]);
  });
  it("has a length", function() {
    expect(list.length).to.equal(3);
  });
  it("can be forEached over", function() {
    let all = [];
    list.forEach(function(item, index) {
      all.push({item, index});
    });
    expect(all[0]).to.deep.equal({item: 1, index: 0});
    expect(all[1]).to.deep.equal({item: 2, index: 1});
    expect(all[2]).to.deep.equal({item: 3, index: 2});
  });

  describe("fill()", function() {
    beforeEach(function() {
      list = list.fill(5,1);
    });

    it("returns an instance of List", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([1,5,5]);
    });
  });

  describe("pop()", function() {
    beforeEach(function() {
      list = list.pop();
    });
    it("returns an instance of List", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([1,2]);
    });
  });

  describe("push()", function() {
    beforeEach(function() {
      list = list.push(10, 15);
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([1,2,3,10,15]);
    });
  });

  describe("reverse()", function() {
    beforeEach(function() {
      list = list.reverse();
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([3,2,1]);
    });
  });

  describe("shift()", function() {
    beforeEach(function() {
      list = list.shift();
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([2,3]);
    });
  });

  describe("sort()", function() {
    beforeEach(function() {
      list = list.sort(function(a, b) {
        if (a > b) {
          return -1;
        } else if (a < b) {
          return 1;
        } else {
          return 0;
        }
      });
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([3,2,1]);
    });
  });

  describe("unshift()", function() {
    beforeEach(function() {
      list = list.unshift(20,30);
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([20,30,1,2,3]);
    });
  });

  describe("concat()", function() {
    beforeEach(function() {
      list = list.concat(1,23);
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([1,2,3, 1, 23]);
    });
  });

  describe("map()", function() {
    beforeEach(function() {
      list = list.map(i => i * 2);
    });
    it("returns an instance of list", function() {
      expect(list).to.be.instanceOf(List);
    });
    it("works", function() {
      expect(list.valueOf()).to.deep.equal([2,4,6]);
    });
  });

});
