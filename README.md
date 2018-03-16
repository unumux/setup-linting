# @unumux/setup-linting

This is a script to automatically setup the UnumUX linting dependencies on an existing project.

## Usage

* Install by running `yarn global add @unumux/setup-linting` OR `npm install -g @unumux/setup-linting`
* From the folder you want to setup linting on, run `setup-linting`

## Recommended editor setup

### Visual Studio Code

* Install the following extensions (if you don't already have them):
  * ESLint
  * Stylelint
  * Prettier - Code formatter
  * Formatting toggle (optional)
* I would recommend that you also make some changes to your VS Code preferences

```json
    "prettier.eslintIntegration": true,
    "prettier.stylelintIntegration": true,
    // the following settings are optional. They will automatically format your JS when you save the file or paste code.
    // The formatting toggle extension listed above can toggle these settings on/off as needed
    "editor.formatOnPaste": true,
    "editor.formatOnSave": true,
```

### Other editors

Recommendations coming soon!

## Planned Features

* Some sort of global defaults (so this doesn't have to be run on every project)
* Scripts to lint/prettify added to package.json
