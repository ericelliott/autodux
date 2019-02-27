module.exports = {
  linters: {
    '*.js': ['eslint --fix', 'git add'],
    '*.md': ['markdownlint', 'textlint', 'git add'],
    '*.{json,yml}': ['prettier --write', 'git add']
  }
};
