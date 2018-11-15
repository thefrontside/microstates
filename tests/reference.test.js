import expect from 'expect';

describe('References', () => {
  class Person {}
  class PersonTable {
    nextId = Number;
    records = { Person };
    createRecord(attrs) {
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
    db = reference(Db);
    records = { Car };
    createRecord() {
      let intermediate = this.db.people.createRecord();
      intermediate.db
      return this.db.people
    }
  }
  class Db {
    people = PersonTable;
    cars = CarTable;
  }

  let db;
  beforeEach(function() {
    db = create(Db)
      .cars.createRecord();

  });

  it('creates a new DB with both the car and its owner')

});
