/**
 * ESLint rule to detect hardcoded user-facing strings
 * Enforces use of i18n system for all user-facing text
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded user-facing strings in favor of i18n system',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedString: 'Hardcoded string detected: "{{text}}". Use i18n system instead: content.{{suggestion}}',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const allowedPatterns = options.allowedPatterns || [
      'console.log',
      'className',
      'data-testid',
      'apiUrl',
      'import',
      'export',
      'require',
    ];
    const ignoreFiles = options.ignoreFiles || [
      '**/*.test.tsx',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.spec.ts',
    ];

    // Check if current file should be ignored
    const filename = context.getFilename();
    const shouldIgnore = ignoreFiles.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filename);
    });

    if (shouldIgnore) {
      return {};
    }

    // Helper function to check if a string is user-facing
    function isUserFacingString(node, text) {
      // Skip empty strings or very short strings
      if (!text || text.length < 3) {
        return false;
      }

      // Skip strings that match allowed patterns
      if (allowedPatterns.some(pattern => text.includes(pattern))) {
        return false;
      }

      // Skip technical strings (URLs, file paths, etc.)
      if (text.includes('http') || text.includes('.') || text.includes('/')) {
        return false;
      }

      // Skip strings that are clearly technical identifiers
      if (text.match(/^[a-z][a-zA-Z0-9]*$/) && text.length < 20) {
        return false;
      }

      // Check if string is in JSX text content
      if (node.parent && node.parent.type === 'JSXText') {
        return true;
      }

      // Check if string is in JSX attribute that might be user-facing
      if (node.parent && node.parent.type === 'JSXAttribute') {
        const attributeName = node.parent.name.name;
        const userFacingAttributes = ['placeholder', 'title', 'alt', 'aria-label'];
        return userFacingAttributes.includes(attributeName);
      }

      // Check if string is in JSX element children
      if (node.parent && node.parent.type === 'JSXElement') {
        return true;
      }

      return false;
    }

    // Helper function to generate suggestion
    function generateSuggestion(text) {
      // Simple suggestion based on text content
      const key = text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '.')
        .substring(0, 30);
      
      return `home.${key}`;
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string' && isUserFacingString(node, node.value)) {
          context.report({
            node,
            messageId: 'hardcodedString',
            data: {
              text: node.value,
              suggestion: generateSuggestion(node.value),
            },
          });
        }
      },
    };
  },
};
