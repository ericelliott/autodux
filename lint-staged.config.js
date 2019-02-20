module.exports = {
  linters: {
    '*.js': ['eslint --fix', 'git add'],
    '*.md': ['prettier --write', 'markdownlint', 'textlint', 'git add'],
    '*.{json,yml}': ['prettier --write', 'git add']
  }
};
