const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');
const whitelister = require('purgecss-whitelister');

module.exports = {
  plugins: [
    autoprefixer(),
    purgecss({
      content: [
        './node_modules/@thulite/doks-core/layouts/**/*.html',
        './node_modules/@thulite/doks-core/content/**/*.md',
        './layouts/**/*.html',
        './content/**/*.md',
      ],
      safelist: [
        'lazyloaded',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'h5',
        'alert-link',
        'container-xxl',
        'container-fluid',
        ...whitelister([
          './node_modules/@thulite/doks-core/assets/scss/common/_variables.scss',
          './node_modules/@thulite/doks-core/assets/scss/components/_alerts.scss',
          './node_modules/@thulite/doks-core/assets/scss/components/_buttons.scss',
          './node_modules/@thulite/doks-core/assets/scss/components/_code.scss',
          './node_modules/@thulite/doks-core/assets/scss/components/_syntax.scss',
          './node_modules/@thulite/doks-core/assets/scss/components/_search.scss',
          './node_modules/@thulite/doks-core/assets/scss/common/_dark.scss',
        ]),
      ],
    }),
  ],
}
