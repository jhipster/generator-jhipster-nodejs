# This is the Roadmap for development. 🎉🎉🎉 Thank you for whatever contribution to one of these features! 🎉🎉🎉

For every feature you can contribute opening a branch called `feature/<numer>` (for example *feature/one* for the first) from the master branch and after a pull request to me.

> Let it free to give advices or tips!

## Feature one - DONE
The blueprint must add nodejs framework only if you choose a **monolithic application** (and after baseName question).
So only in this case there will the custom questions.

> In the other all case (**not monolitich application** choosing, the generator run an error and stop the prompting)


## Feature two - DONE
When you choose monolitich application and nodejs framework, the generator will ask:

* A question for the server package manager type (npm or yarn)
* A question for the base name node app
* A question for the jhipster client framework (angular or react)
* A question for the server port for NestJS node app

So, the generation for now must still follow the jhipster standard with these default values for the other features:


```
		packageName com.example.node,
		cacheProvider no,
		enableHibernateCache false,
		authenticationType session,
		devDatabaseType mongodb,
		prodDatabaseType mongodb,
		buildTool maven,
		serviceDiscoveryType false,
		testFrameworks[cucumber],
		clientPackageManager yarn,
		useSass true,
		skipUserManagement false
```

As you can see you have to modify only the server generator (i18n and the other for now must be unchanged).

## Feature three

As the app use the maven pom.xml to manage client and node server, we have to "clean" that file from unuseful dependencies and orchestrate the frontend and NestJS app.
So we have to add new pom.xml template and NestJS files.
