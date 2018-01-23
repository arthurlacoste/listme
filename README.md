<p align="center">
  <img src="static/assets/img/listme-title-black.svg" height="100">
  <p align="center">A tool to make lists and share them with your friends.<p>
  <p align="center"><a href="https://npmjs.org/package/listme"><img src="https://img.shields.io/npm/v/listme.svg" alt="NPM Version"></a> <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" alt="XO code style"></a> <a href="https://travis-ci.org/arthurlacoste/listme"><img src="https://secure.travis-ci.org/arthurlacoste/listme.svg" alt="build status"></a>
  <a href='https://coveralls.io/github/arthurlacoste/listme?branch=master'><img src='https://coveralls.io/repos/github/arthurlacoste/listme/badge.svg?branch=master' alt='Coverage Status' /></a>
  </p>
</p>

Each element can be upvoted or downvoted. Usefull for :
- a movie list with your girlfriend
- a gift list for a friend
- a shopping list with your roommates

## Features

- Upvote or down vote an item (IP are checked to avoid cheating)

[Start to make lists !](https://listme.irz.fr)

## List of lists

- [Ideas for listme](https://listme.irz.fr/#features)
- [Bug tracker](https://listme.irz.fr/#bugs)
- [Best movies ever](https://listme.irz.fr/#best-movies-ever)

## Developpement

### API

Listme provides a simple API to make your own apps using the same engine.

- [Check the API REST doc](https://listme.irz.fr/doc/)

### Install

Project is made in two separate routes :
- static content for render, client side (including Liquid templating) & host on Github Pages
- Node process as [API REST](https://listme.irz.fr/doc/), who host and talk with database

```shell
git clone https://github.com/arthurlacoste/listme
npm install lessc pm2 -g
npm install
npm start
```

Photo by Tim Gouw on Unsplash
