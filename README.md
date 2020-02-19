
# ![A7JS](./designs/banner.png)

![Version](https://img.shields.io/npm/v/a7js)
![size](https://img.shields.io/badge/size-3kb-success)
![Downloads](https://img.shields.io/npm/dt/a7js)

🔥 A lot of power in a small package.

✅ 3kB Runtime when gzipped and minified.

⚡ Its stupid fast.

⚙️ Supports modular design.

😍 Easy to use.

🚀 Provides compression and minification.

👑 Supports ES6 Imports abd exports, while you write everything else in ES5.

👨‍💻 Official Discord [discord.gg/388FREA](https://discord.gg/388FREA) - Server under construction

🧩 Contributions are more than welcome!

# Main features of A7JS

CLI - Development server and boilerplate for new projects, components

Router - Fully working frontend routing system.

Modular Design - split parts of your app into components!

# Setup

Install it

```shell
npm i a7js -g
```

Start a new project

```shell
a7 newproject [projectname]
```

Cd into the new project

```shell
cd [newproject]
```

Run development server

```shell
a7 devserver
```

# Motivation

Most of the commonly used libraries / frameworks are really large and also packs in features that most of the users will never use.

a7JS focuses on the stuff that would be really hard to make from scratch.

If there is something that you feel like we could add make an feature request. We aprove those which would benefit us all!

And it has 0 dependencies on the code that runs at the front end and also it is fully es5.

The dependencies that it has are for the cli and other useful tools.

# Code examples and Documentation

Working on v4 up to date documentation

For documentation and code examples please visit our [Wiki](https://github.com/anton7r/a7JS/wiki)

# License

MIT License [license](https://github.com/anton7r/a7JS/blob/master/LICENSE)

# Community

Discord: [discord.gg/388FREA](https://discord.gg/388FREA)

# Changes

## Version 5 (March 2020)

Expected to release in March 2020.
Including better frontend performance and some changes that we can't change anymore on version 4.

Features that we plan to release with it

- Improved performance

- Improved syntax

- Smaller compiler output

- Auto reload to development server

## 5.0.0-alpha2

- Reduced your apps bundle size

- Optimized CLI

- Bug Fixes

## 5.0.0-alpha1

- Improved syntax

- Development server auto reload

- Custom error messages

## Version 4 (December 2019)

- Performance improvements

- Better Documentation

- Better CLI

- Development Server

- Etc...

Also CLI now works silently unless an error occurs

## 4.0.0 Initial release

Project metadata is now saved to `./package.json`, this is neccessary for upgrading configuration files

Configuration file loading more stricter and less error prone.

Removed "scoped css", it did not work as intended so we removed it

## 4.0.0-rc.1.8

This update contains improvements to the development server,

removed the need of defining development server in your project at `a7.config.json`.
to get rid of it simply just run `a7 upgrade config`;

## 4.0.0-rc.1.7

rewriting few parts in the framework.

reduced size from 49kB to 47kB.

## 4.0.0-rc.1.6

Changes in cli appearance

## 4.0.0-rc.1.5

Bug fixes all the way!

## 4.0.0-rc.1.4

Code abstraction and improved performance.

## 4.0.0-rc.1.3

Updated Development server to run faster,
and fixed bugs that were introduced in the last update.

## 4.0.0-rc.1.2

Speed improvements and removed legacy code.
Improved Dev server.

## 4.0.0-rc.1.1

Bug Fixes.

## 4.0.0-rc.1

Bug Fixes.

## 4.0.0-beta.10

Fixed a bug in the development server.

Added a feature that adds component automatically to your main javascript file when creating it using the `a7 newcomponent ...` command.

## Before 4.0.0

The state of A7JS back then was just small blob compared to the state of it right now.
The only thing that has stayed from Version 1 is the router and how it works, since then it has been improved on.

Writing apps in A7JS version 3 was also quite painful since you were writinh pretty much the code that your application is now adays compiled to.

While version 3 wasn't the best, it enabled us to make it even better with version 4.
Also version 3 was pretty much a complete rewrite of the framework.

Around version 2 & version 1 it was a pain to make an application using A7JS.
