export default Object.assign || function(target, ...sources) {
  return sources.reduce(function(target, source) {
    Object.keys(source).forEach(function(property) {
      target[property] = source[property];
    });
    return target;
  }, target);
}
