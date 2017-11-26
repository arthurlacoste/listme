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

- [Ideas for listme](https://listme.irz.fr/#ByPKjG4xz)
- [Bug tracker](https://listme.irz.fr/#bugs)
- [Best movies ever](https://listme.irz.fr/#SkLDW7Exf)

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
