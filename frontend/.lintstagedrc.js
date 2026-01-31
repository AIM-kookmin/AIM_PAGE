module.exports = {
  // Run ESLint on TypeScript and JavaScript files (excluding test and config files)
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const eslintFiles = filenames.filter(
      file =>
        !file.includes('.test.') &&
        !file.includes('.config.') &&
        !file.includes('lintstagedrc') &&
        !file.includes('jest.setup.')
    )
    if (eslintFiles.length === 0) return []
    return [
      `eslint --fix ${eslintFiles.join(' ')}`,
    ]
  },

  // Run tests separately (much lighter)
  '*.test.{js,jsx,ts,tsx}': [
    'eslint --fix',
  ],
}
