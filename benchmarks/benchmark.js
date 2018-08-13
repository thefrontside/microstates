export default function(name, definition) {
  return function(suite) {
    return definition({
      add(desc, operation) {
        return suite.add(desc, function() {
          this.suiteName = name;
          return operation();
        });
      }
    })
  }
}
