# This is the Roadmap fot development. 🎉🎉🎉 Thank you for whatever contribution to one of these features! 🎉🎉🎉

For every feature you can contribute opening a branch called `feature/<numer>` (for example *feature/one* for the first) from the master branch and after a pull request to me.

> Let it free to give advices or tips!

## Feature one
The blueprint must add nodejs framework only if you choose a **monolithic application** (and after baseName question).
So only in this case there will be a question to choose the language framework (java or nodejs). 

> If you choose nodejs language there will be the blueprint custom questions. In the other all case (**not monolitich application or java language** choosing, the generator is retrocompatible with the standard jhipster questions and generation)


## Feature two
When you choose monolitich application and nodejs framework, the generator will ask:

* A question for the package manager type (npm or yarn)
* A question for the jhipster client framework (angular or react)
* A question for the server port

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

As you can see you have to modify only the server and the client generator (i18n and the other for now must be unchanged).
