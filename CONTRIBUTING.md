# Contributing

We are super happy if you are interested in contributing to the documentation of the Green Metrics Tool.

All contributions should be done via Pull Requests. We use the standard forking workflow for Pull Requests. If you are not familiar with forks, you can find more information e.g. in [GitHub's documentation](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project)

## Lint

We use [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) for linting the content of the documentation.

To check if the content has linting issues you can call

```sh
npm run lint:markdown
```

in the project directory.

To automatically resolve fixable issues, use

```sh
npm run lint:markdown-fix
```

We recommend that you set a pre-commit hook to lint and fix issues automatically every time you commit. This can be done by adding

```sh
npm run lint:markdown-fix:staged
```

to a file named `./.git/hooks/pre-commit` and making it executable `chmod +x ./.git/hooks/pre-commit`
