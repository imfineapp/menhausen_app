/**
 * ESLint plugin for i18n enforcement
 */

import noHardcodedStrings from './no-hardcoded-strings.js';

export default {
  rules: {
    'no-hardcoded-strings': noHardcodedStrings,
  },
};
