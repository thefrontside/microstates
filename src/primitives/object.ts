export default {
  assign: (current: {}, props: {}) => ({
    ...current,
    ...props,
  }),
};
