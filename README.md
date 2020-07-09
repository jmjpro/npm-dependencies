## Exercise ##
This exercise focuses on stages 1 and 2 above, for a package that is already published on npmjs.com. 
Your task is to design and implement a web service. This service should return the full package dependency tree based on a given package name (user input), which we could then later use for stage 3. 
You can obtain package data through the npm registry using the following URL format: https://registry.npmjs.org/<package_name>/<version_or_tag> 
For example: https://registry.npmjs.org/express/latest or https://registry.npmjs.org/async/2.0.1 

## Things to consider ##
- There are currently over 1M packages on npmjs.com, and the number is growing all the time. 
- The packages update from time to time, just as their dependencies do too. 
- Consider these important factors that can make or break a great web service: API, architecture, data storage, low latency, scalability, monitoring, you name it :) 

## Implementation ##
1. Create a working application that, given the name of a published npm package, returns 
the entire set of dependencies for the package.
2. Present the dependencies in a tree view.
3. We require tests. It’s up to you what style and how exhaustive these are.
4. Account for asynchronous fetching of dependencies as you see fit.
5. Consider caching relevant data so that repeated requests resolve with minimum latency.
