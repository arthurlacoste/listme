[![NPM Version][npm-version]][npm-url]
[![travis][travis-badge]][travis-url]
[![xo][xo-badge]][xo-url]

# listme

Listme is a tool to make lists and share with your friends.

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

[npm-version]:https://img.shields.io/npm/v/listme.svg
[npm-url]: https://npmjs.org/package/listme
[travis-badge]: http://img.shields.io/travis/arthurlacoste/listme.svg
[travis-url]: https://travis-ci.org/arthurlacoste/listme
[xo-badge]: https://img.shields.io/badge/code_style-XO-5ed9c7.svg
[xo-url]: https://github.com/sindresorhus/xo
