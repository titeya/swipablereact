# swipablereact

<!--[![build status](http://img.shields.io/travis/voronianski/react-swipe.svg?style=flat)](https://travis-ci.org/voronianski/react-swipe)
[![npm version](http://badge.fury.io/js/react-swipe.svg)](http://badge.fury.io/js/react-swipe)
[![Download Count](http://img.shields.io/npm/dm/react-swipe.svg?style=flat)](http://www.npmjs.com/package/react-swipe)

> [Brad Birdsall](https://github.com/thebird)'s [Swipe.js](http://swipejs.com) as a [React](http://facebook.github.io/react) component.-->


## Install

```bash
npm install react swipablereact
```

## Usage

### Example

```javascript
import React from 'react'
import ReactDOM from 'react-dom';
import SwipableComp from 'swipablereact';

class Swipe extends React.Component {
    render() {
        return (
            <SwipableComp >
                <div>1</div>
                <div>2</div>
                <div>3</div>
            </ReactSwipe>
        );
    }
}

ReactDOM.render(
    <Swipe />, 
    document.getElementById('app')
);
```

### Props

- `index: ?Number` - Index
- `distance: ?Number` - width slide
- `espace: ?Number` - 
- `height: ?Any` - 
- `position: ?string` - 
- `modif: ?Bool` - 
- `resistance: ?Bool` - 
- `iconLeft: ?Any` - 
- `iconRigth: ?Any` - 
- `childBgColor: ?String` - 
- `contBgColor: ?String` - 
- `decal: ?Number` - 
- `navigation: ?Bool` - 
- `vitesse: ?Number` - speed
- `onChangepourc: ?Func` - Callback function - slide %
