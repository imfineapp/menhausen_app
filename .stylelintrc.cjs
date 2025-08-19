module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss'
  ],
  plugins: [
    'stylelint-order'
  ],
  rules: {
    // Allow Tailwind's @import and @layer directives
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'variants',
          'responsive',
          'screen'
        ]
      }
    ],
    // Allow CSS custom properties
    'custom-property-empty-line-before': null,
    // Allow Tailwind's utilities
    'selector-class-pattern': null,
    // Allow CSS Grid and Flexbox values
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['font-family']
      }
    ],
    // Disable property ordering requirement for better flexibility
    'order/properties-order': null,
    // Allow oklch color notation without percentage/degree requirements
    'lightness-notation': null,
    'hue-degree-notation': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,
    // Allow short and long hex colors
    'color-hex-length': null,
    // Allow duplicate selectors (for progressive enhancement)
    'no-duplicate-selectors': null,
    // Allow vendor prefixes for webkit properties
    'property-no-vendor-prefix': null,
    // Allow CSS4 features and functions
    'function-no-unknown': null,
    'declaration-property-value-no-unknown': null,
    // Allow legacy media queries
    'media-feature-range-notation': null,
    // Allow zero without units
    'length-zero-no-unit': null,
    // Allow comments without empty lines
    'comment-empty-line-before': null
  },
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*'
  ]
}
