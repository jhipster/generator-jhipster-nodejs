# Samples

The applications the CI generates and tests. Each samples group is a workflow of the CI, a module of the parent folder
(`angular.js`, `react.js`, `vue.js`, `microservice.js`) listing its samples:

- a sample ending with `-jdl` is generated from a jdl file of this folder: its client framework, authentication type
  and production database, in its name, are given as options to a template (`monolith-react-oauth2-jdl` generates
  `monolith-client-auth-template-jdl.jdl` with `clientFramework react` and `authenticationType oauth2`);
- a sample ending with `-dev` is a folder of this one with a `.yo-rc.json` file (`monolith-angular-jwt-i18n-dev`);
- `microservice-oauth2-jdl.jdl` is generated as it is.

Generate a sample by its name, or choose one from the prompts:

```bash
./cli/cli.cjs generate-sample monolith-react-oauth2-jdl
./cli/cli.cjs generate-sample
```

`./cli/cli.cjs describe-samples` lists the samples, with what each one generates.
