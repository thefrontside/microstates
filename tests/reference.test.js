import expect from 'expect';
import { create } from '../src/microstates';
import { valueOf } from '../src/meta';

const {
  getOwnPropertyNames
} = Object;

function reference(Type, fn) {
  let ref = fn(this);
  return class extends Type {}
}

describe('References', () => {
  class Person {}

  class PersonTable {
    db = Db;
    nextId = Number;
    records = { Person };
    createRecord(attrs = {}) {
      let id = this.nextId.state;

      return this
        .nextId.increment()
        .records.put(id, attrs)
    }
  }

  class Car {
    ownerId = Number;
  }

  class CarTable {
    db = Db;
    nextId = Number;
    records = { Car };
    createRecord(attrs = {}) {
      let id = this.nextId.state;
      let personId = this.db.people.nextId.state;
      let intermediate = this.db.people.createRecord();

      console.log("intermediate = ", intermediate);

      return intermediate
        .nextId.increment()
        .records.put(id, { personId, ...attrs })
    }
  }

  class Db {
    people = PersonTable;

    get cars() {
      let value = valueOf(this) == null ? {} : valueOf(this);
      return create(CarTable, value, { db: this });
    }
  }

  let db;
  beforeEach(function() {
    db = create(Db)
      .cars.createRecord();
  });

  it('creates a new DB with both the car and its owner', () => {
    expect(getOwnPropertyNames(db.cars.records).length).toEqual(1);
    expect(getOwnPropertyNames(db.people.records).length).toEqual(1);
  });
});
