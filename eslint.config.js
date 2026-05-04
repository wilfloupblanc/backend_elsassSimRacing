import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintPluginPrettier from "eslint-plugin-prettier"
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort"

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "simple-import-sort": eslintPluginSimpleImportSort
    },
    rules: {
      "no-useless-catch": "off",
      "prettier/prettier": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-throw-literal": "off",
      "no-throw-literal": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^@?\\w"],
            [
              "^(@app|@config|@core|@controllers|@fixtures|@middlewares|@entity|@repository|@router|@services|@tests|@types)(/.*|$)"
            ],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.s?css$"]
          ]
        }
      ]
    }
  }
)
