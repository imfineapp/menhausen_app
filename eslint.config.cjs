const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");

const {
    fixupConfigRules,
    fixupPluginRules,
} = require("@eslint/compat");

const tsParser = require("@typescript-eslint/parser");
const reactRefresh = require("eslint-plugin-react-refresh");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([
    // Browser/React configuration
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        ignores: ["**/dist/**", "**/node_modules/**", "**/imports/**", "**/scripts/**", "**/*.config.{js,cjs,mjs}", "**/.eslintrc.cjs", "**/.stylelintrc.cjs"],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parser: tsParser,
        },
        extends: fixupConfigRules(compat.extends(
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:react-hooks/recommended",
        )),
        plugins: {
            "react-refresh": reactRefresh,
            "@typescript-eslint": fixupPluginRules(typescriptEslint),
        },
        rules: {
            "react-refresh/only-export-components": "off",
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_|^CompletionCelebration$",
            }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-var-requires": "off",
        },
    },
    // Node.js scripts configuration
    {
        files: ["**/scripts/**/*.{js,cjs}"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "@typescript-eslint/no-var-requires": "off",
            "no-undef": "off",
        },
    },
    // Config files (ignore linting)
    {
        files: ["**/*.config.{js,cjs,mjs}", "**/.eslintrc.cjs", "**/.stylelintrc.cjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            "@typescript-eslint/no-var-requires": "off",
            "no-undef": "off",
        },
    },
    globalIgnores(["**/dist", "**/node_modules", "**/imports/**"]),
]);
