# Epoche
[![npm version](https://img.shields.io/npm/v/epoche)](https://www.npmjs.com/package/epoche)
[![npm downloads](https://img.shields.io/npm/dm/epoche)](https://www.npmjs.com/package/epoche)

A modern, small wiki engine without complexity. **See it in action:** <https://epoche.org/wiki/>

## Features

- Powered by Node.js + SQLite3: all you need is `npm`
- Support Markdown with [unified](https://github.com/unifiedjs/unified)
  - [x] Math (with MathJax)

## Install

```
npm install -g epoche
```

## Usage

#### Set up:

```
epoche init ./epoche.db  # create & init database
```

#### Start wiki:

```
epoche start --db ./epoche.db --port 3000
```

With [pm2](https://pm2.keymetrics.io/) (daemonize):

```
pm2 start epoche -- start --db ./epoche.db --port 3000
```

Using Nginx, Apache, or the like is recommended for load balancing etc.

#### Help:

```
epoche help
```

## Extra syntax

- **Wiki links:** `[<link text>](<page name>)` (eg. `[foo bar](FooBar)`)

## Todo

- [x] Wiki-style link
- [ ] History diff/restore/delete
- [ ] Syntax highlighting
- [ ] File uploads?
- [ ] Add tests
