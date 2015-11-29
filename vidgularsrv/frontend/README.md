<<<<<<< HEAD
# angular-seed — the seed for AngularJS apps

This project is an application skeleton for a typical [AngularJS](http://angularjs.org/) web app.
You can use it to quickly bootstrap your angular webapp projects and dev environment for these
=======
# Webcasting-Room-Example
RT Webcasting Room using: 
- MEAN + Redis + SocketIO

IMPORTANT NOTICE: The app demonstarte the room functionality only, !!no video broadcasting is implemented - yet!!

Architecture:
- Redis PuSub for multi App Server communication
- Install 2 (master/slave) Redis for fail-safe
- Redis Session store active but not used - can be used for caching
- MongoDB for users account + application persistant information
- Install 2 App Servers for fail safe
- App server is stateless

Application Features:
- Token based authentication
- Register for user & broadcast
- Login using facebook - users only
- 2 roles: user/broadcaster
- Liquid Layout using FlexBox
- Sample users list & manage on Home page
- Video (user/broadcast) room behaviour:
-- Users control
+ ask questions
+ ask permission to speak
+ vote on questions
+ applause
-- Broadcaster control
+ manage questions
+ manage user
+ grant/revoke speak permission

#TODO
- add video/audio broadcasting (from mobile, browser or desktop app)
- add roles: system,admin
- add rooms manager
- caching

# Webcasting-Room-seed — the seed for MEAN+Redis+SocketIo

This project is an application skeleton for a typical [Webcasting-Room-seed](http: -TBD) web app.
You can use it to quickly bootstrap your Webcasting-Room webapp projects and dev environment for these
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
projects.

The seed contains a sample AngularJS application and is preconfigured to install the Angular
framework and a bunch of development and testing tools for instant web development gratification.

<<<<<<< HEAD
The seed app doesn't do much, just shows how to wire two controllers and views together.


## Getting Started

To get you started you can simply clone the angular-seed repository and install the dependencies:

### Prerequisites

You need git to clone the angular-seed repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test angular-seed. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone angular-seed

Clone the angular-seed repository using [git][git]:

```
git clone https://github.com/angular/angular-seed.git
cd angular-seed
```

If you just want to start a new project without the angular-seed commit history then you can do:

```bash
git clone --depth=1 https://github.com/angular/angular-seed.git <your-project-name>
=======

## Getting Started

To get you started you can simply clone the web-casting-room repository and install the dependencies:

### Prerequisites

You need git to clone the web-casting-room repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

We also use a number of node.js tools to initialize and test web-casting-room. You must have node.js and
its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

### Clone web-casting-room

Clone the web-casting-room repository using [git][git]:

```
git clone https://github.com/adico-twistit/web-casting-room.git
cd web-casting-room
```

If you just want to start a new project without the web-casting-room commit history then you can do:

```bash
git clone --depth=1 https://github.com/adico-twistit/web-casting-room.git <your-project-name>
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
```

The `depth=1` tells git to only pull down one commit worth of historical data.

### Install Dependencies

We have two kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*Note that the `bower_components` folder would normally be installed in the root folder but
<<<<<<< HEAD
angular-seed changes this location through the `.bowerrc` file.  Putting it in the app folder makes
=======
web-casting-room changes this location through the `.bowerrc` file.  Putting it in the app folder makes
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
it easier to serve the files by a webserver.*

### Run the Application

We have preconfigured the project with a simple development web server.  The simplest way to start
this server is:

```
npm start
```

<<<<<<< HEAD
Now browse to the app at `http://localhost:8000/app/index.html`.
=======
Now browse to the app at `http://localhost:8000/`.
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984



## Directory Layout

```
app/                    --> all of the source files for the application
  app.css               --> default stylesheet
  components/           --> all app specific modules
    version/              --> version related components
      version.js                 --> version module declaration and basic "version" value service
      version_test.js            --> "version" value service tests
      version-directive.js       --> custom directive that returns the current app version
      version-directive_test.js  --> version directive tests
      interpolate-filter.js      --> custom interpolation filter
      interpolate-filter_test.js --> interpolate filter tests
  view1/                --> the view1 view template and logic
    view1.html            --> the partial template
    view1.js              --> the controller logic
    view1_test.js         --> tests of the controller
  view2/                --> the view2 view template and logic
    view2.html            --> the partial template
    view2.js              --> the controller logic
    view2_test.js         --> tests of the controller
  app.js                --> main application module
  index.html            --> app layout file (the main html template file of the app)
  index-async.html      --> just like index.html, but loads js files asynchronously
karma.conf.js         --> config file for running unit tests with Karma
e2e-tests/            --> end-to-end tests
  protractor-conf.js    --> Protractor config file
  scenarios.js          --> end-to-end scenarios to be run by Protractor
```

## Testing

<<<<<<< HEAD
There are two kinds of tests in the angular-seed application: Unit tests and End to End tests.

### Running Unit Tests

The angular-seed app comes preconfigured with unit tests. These are written in
=======
There are two kinds of tests in the web-casting-room application: Unit tests and End to End tests.

### Running Unit Tests

The web-casting-room app comes preconfigured with unit tests. These are written in
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. We provide a Karma
configuration file to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if your unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to end testing

<<<<<<< HEAD
The angular-seed app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
=======
The web-casting-room app comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
are run with the [Protractor][protractor] End-to-End test runner.  It uses native events and has
special features for Angular applications.

* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/scenarios.js`

Protractor simulates interaction with our web app and verifies that the application responds
correctly. Therefore, our web server needs to be serving up the application, so that Protractor
can interact with it.

```
npm start
```

<<<<<<< HEAD
In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
=======
In addition, since Protractor is built upon WebDriver we need to install this.  The web-casting-room
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


<<<<<<< HEAD
## Updating Angular

Previously we recommended that you merge in changes to angular-seed into your own fork of the project.
Now that the angular framework library code and tools are acquired through package managers (npm and
=======
## Updating web-casting-room

Previously we recommended that you merge in changes to web-casting-room into your own fork of the project.
Now that the web-casting-room framework library code and tools are acquired through package managers (npm and
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
bower) you can use these tools instead to update the dependencies.

You can update the tool dependencies by running:

```
npm update
```

This will find the latest versions that match the version ranges specified in the `package.json` file.

<<<<<<< HEAD
You can update the Angular dependencies by running:
=======
You can update the web-casting-room dependencies by running:
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984

```
bower update
```

This will find the latest versions that match the version ranges specified in the `bower.json` file.


## Loading Angular Asynchronously

<<<<<<< HEAD
The angular-seed project supports loading the framework and application scripts asynchronously.  The
special `index-async.html` is designed to support this style of loading.  For it to work you must
inject a piece of Angular JavaScript into the HTML page.  The project has a predefined script to help
do this.

```
npm run update-index-async
```

This will copy the contents of the `angular-loader.js` library file into the `index-async.html` page.
You can run this every time you update the version of Angular that you are using.


## Serving the Application Files

While angular is client-side-only technology and it's possible to create angular webapps that
don't require a backend server at all, we recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

The angular-seed project comes preconfigured with a local development webserver.  It is a node.js
=======
TODO? - TBD

### Running the App during Development

The web-casting-room project comes preconfigured with a local development webserver.  It is a node.js
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally:

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under the `app/` directory.


### Running the App in Production

<<<<<<< HEAD
This really depends on how complex your app is and the overall infrastructure of your system, but
the general rule is that all you need in production are all the files under the `app/` directory.
Everything else should be omitted.

Angular apps are really just a bunch of static html, css and js files that just need to be hosted
somewhere they can be accessed by browsers.

If your Angular app is talking to the backend server via xhr or other means, you need to figure
out what is the best way to host the static files to comply with the same origin policy if
applicable. Usually this is done by hosting the files by the backend server or through
reverse-proxying the backend server(s) and webserver(s).

=======
TBD
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984

## Continuous Integration

### Travis CI

[Travis CI][travis] is a continuous integration service, which can monitor GitHub for new commits
<<<<<<< HEAD
to your repository and execute scripts such as building the app or running tests. The angular-seed
=======
to your repository and execute scripts such as building the app or running tests. The web-casting-room
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
project contains a Travis configuration file, `.travis.yml`, which will cause Travis to run your
tests when you push to GitHub.

You will need to enable the integration between Travis and GitHub. See the Travis website for more
instruction on how to do this.

### CloudBees

<<<<<<< HEAD
=======
TBD

BELOW LEFT FOR REFERENCE
>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
CloudBees have provided a CI/deployment setup:

<a href="https://grandcentral.cloudbees.com/?CB_clickstart=https://raw.github.com/CloudBees-community/angular-js-clickstart/master/clickstart.json">
<img src="https://d3ko533tu1ozfq.cloudfront.net/clickstart/deployInstantly.png"/></a>

If you run this, you will get a cloned version of this repo to start working on in a private git repo,
along with a CI service (in Jenkins) hosted that will run unit and end to end tests in both Firefox and Chrome.


## Contact

<<<<<<< HEAD
=======
TBD

BELOW LEFT FOR REFERENCE

>>>>>>> ce0272afdb49d980fd3257da2a325984277d0984
For more information on AngularJS please check out http://angularjs.org/

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server