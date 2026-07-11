module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // Candidate masks, pencil-note bitmasks, and the PRNG are all bitmask-based.
    'no-bitwise': 'off',
  },
};
