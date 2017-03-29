# 🎥 open-pip [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


Module that will let you open a movie url/path in macOS native picture-in-picture player.

Both local files and urls are supported.

Known **working** formats
  - mp4
  - m4v
  - mov

Known **not** working formats
  - mkv
  - avi

## example

![example](https://cloud.githubusercontent.com/assets/5027156/24427478/535eabd6-140b-11e7-9115-951e90ccf278.gif)

## install

```sh
yarn add open-pip
```

## Usage

```js
const open = require('open-pip')

open('/path/to/movie.mp4')
  .then(() => console.log('Worked 🎉'))
  .catch(error => console.log('Something went wrong 💀', error))
```

### How does it work?

It uses child-process-promise to run this command:
```sh
open pip.app --args <absolute-path-to-file>
```

pip.app is a simple macOS app that reads the input argument and tries to load it in an AVPlayer

Source for `pip.app` can be found here: https://github.com/albinekb/open-pip-app
### Credits

Inspiration came from this hack: https://github.com/steve228uk/PiPHack

### Author

Albin Ekblom ([@albinekb](https://github.com/albinekb))
