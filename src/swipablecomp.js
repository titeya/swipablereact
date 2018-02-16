import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowequal from 'shallowequal';
import Swipeable from './swipelib';

class SwipableComp extends Component {
  constructor(props) {
    super(props);
    const { index } = this.props;
    this.state = { index: index };
    this.direction = 'left';
    this.lastUpdateCall = null;
    this.time = false;
    this.style = {
      overflow: 'hidden',
      position: 'relative',
      height: this.props.height
    };
    this.position = 0;
    this.ready = true;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.index !== this.props.index) this.Swipe(nextProps.index);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowequal(this.props.children, nextProps.children) ||
      nextProps.index !== this.props.index ||
      this.props.modif !== nextProps.modif
    );
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.maxswipe) this.updatewindowsize();
  }

  componentDidMount() {
    const { index } = this.props;
    window.addEventListener('resize', this.updatewindowsize, { passive: true });
    this.updatewindowsize();
    if (index !== 0) this.Swipe(index, false);
  }
  componentWillUnmount() {
    if (this.time) clearTimeout(this.time);
    window.removeEventListener('resize', this.updatewindowsize);
  }
  isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };
  updatewindowsize = () => {
    this.swipe = this.refs.swipecont.style;
    this.swipeWidth = this.refs.swipecont.offsetWidth;
    this.distance = this.props.distance ? this.props.distance : this.swipeWidth / 2;
    this.swipenbs = this.props.children instanceof Array ? this.props.children.length : 1;
    this.maxswipe =
      this.props.children instanceof Array ? `-${(this.swipenbs - 1) * this.swipeWidth}` : 0;
    this.maxzone = this.props.children instanceof Array ? `-${this.swipenbs * this.swipeWidth}` : 0;
    if (this.props.decal !== 0)
      this.maxswipe = Number(this.maxswipe) + this.props.decal * (this.swipenbs - 1);
    this.Swipe(this.state.index, false);
  };

  listElem() {
    const cont = this.props.children instanceof Array ? this.props.children : [this.props.children];

    return cont.map((elem, index) => {
      const decal = this.props.decal;
      const espaceR = cont.length - 1 !== index ? this.props.espace : 0;
      return (
        <div
          key={index}
          style={{
            height: this.props.height,
            width: 'calc(100% - ' + decal + 'px )',
            marginRight: espaceR + 'px',
            flexShrink: 0,
            backgroundColor: this.props.childBgColor
          }}
        >
          {elem}
        </div>
      );
    });
  }

  Swipe(index, anim = true) {
    let { vitesse } = this.props;
    if (!anim) vitesse = 0;

    const cont = this.swipenbs > 1 ? this.props.children : [this.props.children];

    if (this.lastUpdateCall) cancelAnimationFrame(this.lastUpdateCall);
    const rogne =
      cont.length - 1 !== index
        ? (this.props.decal - this.props.espace) * index
        : this.props.decal * index;
    const decal = -(this.swipeWidth * index - rogne);
    this.position = decal;

    Object.assign(this.swipe, {
      transition: `transform ${vitesse}ms cubic-bezier(0.23, 1, 0.32, 1)`,
      transform: `translate3d(${decal}px,0,0)`
    });
    this.ready = false;
    if (this.time) clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.ready = true;
      this.props.onChangeIndex(index);
    }, vitesse);

    this.lastUpdateCall = null;
    this.resultpourc(decal, true, index);
    this.setState({ index: index });
  }

  resultpourc(nb, end, index) {
    const { vitesse } = this.props;
    const increment = end ? 0 : 100 * this.swipenbs * nb / this.maxzone;
    const pourc = end ? index * 100 : nb ? Math.round(increment) : 0;
    this.props.onChangepourc(pourc, end, vitesse);
  }

  swiping(deltaX, velo, direction) {
    if (direction === 'left' || direction === 'right') {
      if (this.lastUpdateCall) cancelAnimationFrame(this.lastUpdateCall);

      this.lastUpdateCall = requestAnimationFrame(() => {
        this.direction = direction;
        let translate = direction === 'left' ? -deltaX + this.position : deltaX + this.position;

        if (this.state.index === 0 && translate > 0)
          translate = this.props.resistance
            ? direction === 'left' ? -deltaX / 10 + this.position : deltaX / 10 + this.position
            : 0;

        if (this.state.index === this.swipenbs - 1 && translate < this.maxswipe)
          translate = this.props.resistance
            ? direction === 'left' ? -deltaX / 10 + this.position : deltaX / 10 + this.position
            : this.maxswipe;

        Object.assign(this.swipe, {
          transition: 'none',
          transform: `translate3d(${translate}px,0,0)`
        });
        this.lastUpdateCall = null;
        this.resultpourc(translate, false, this.state.index);
      });
    } else {
      this.direction = false;
    }
  }
  swiped(deltaX, velo) {
    if (deltaX !== 0) {
      switch (this.direction) {
        case 'left':
          if (this.state.index + 1 < this.swipenbs) {
            deltaX > this.distance || (velo > 0.3 && deltaX > 20)
              ? this.Swipe(this.state.index + 1)
              : this.Swipe(this.state.index);
          } else {
            this.Swipe(this.state.index);
          }
          break;

        case 'right':
          if (this.state.index - 1 >= 0) {
            deltaX < -this.distance || (velo > 0.3 && deltaX < -20)
              ? this.Swipe(this.state.index - 1)
              : this.Swipe(this.state.index);
          } else {
            this.Swipe(this.state.index);
          }
          break;

        default:
          this.Swipe(this.state.index);
          break;
      }
    }
  }
  navigationNT(cote) {
    if (this.props.navigation) {
      const action = (e, direction) => {
        e.stopPropagation();
        switch (direction) {
          case 'left':
            if (this.state.index > 0) this.Swipe(this.state.index - 1);
            break;
          case 'right':
            if (this.state.index + 1 < this.swipenbs) this.Swipe(this.state.index + 1);
            break;
        }
      };
      if (!this.isTouchDevice()) {
        const style = {
          position: 'absolute',
          top: this.props.height / 2 - 19,
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          padding: 5,
          cursor: 'pointer'
        };
        let retour = '';
        if (cote == 'left' && this.swipenbs > 1 && this.state.index != 0) {
          return (
            <div
              style={{ ...style, left: 0 }}
              onTouchTap={e => {
                action(e, 'left');
              }}
            >
              {this.props.iconLeft}
            </div>
          );
        }
        if (cote == 'right' && this.swipenbs > 1 && this.state.index + 1 < this.swipenbs) {
          return (
            <div
              style={{ ...style, right: 0 }}
              onTouchTap={e => {
                action(e, 'right');
              }}
            >
              {this.props.iconRight}
            </div>
          );
        }
      }
    }
  }
  render() {
    const ref = 'swipecont';
    return (
      <div
        style={{
          position: this.props.position,
          width: '100%',
          height: this.props.height,
          backgroundColor: this.props.contBgColor
        }}
      >
        <Swipeable
          style={this.style}
          onSwipingLeft={(e, deltaX, deltaY, absX, absY, velo) =>
            this.swiping(deltaX, velo, 'left', e)}
          onSwipingRight={(e, deltaX, deltaY, absX, absY, velo) =>
            this.swiping(deltaX, velo, 'right', e)}
          onSwipingUp={(e, deltaX, deltaY, absX, absY, velo) => this.swiping(deltaX, velo, 'up', e)}
          onSwipingDown={(e, deltaX, deltaY, absX, absY, velo) =>
            this.swiping(deltaX, velo, 'down', e)}
          preventDefaultTouchmoveEvent={false}
          delta={10}
          onSwiped={(e, deltaX, y, isF, velo) => this.swiped(deltaX, velo)}
        >
          <div
            ref={ref}
            style={{
              position: 'relative',
              height: '100%',
              flexDirection: 'row',
              display: 'flex',
              touchAction: 'pan-y',
              willChange: 'transform'
            }}
          >
            {this.listElem()}
          </div>
        </Swipeable>
        {this.navigationNT('left')}
        {this.navigationNT('right')}
      </div>
    );
  }
}
SwipableComp.defaultProps = {
  index: 0,
  iconLeft: '<',
  iconRigth: '>',
  resistance: true,
  distance: false,
  espace: 0,
  height: 'initial',
  position: 'relative',
  modif: false,
  childBgColor: 'white',
  contBgColor: 'black',
  decal: 0,
  navigation: false,
  vitesse: 500,
  onChangepourc: () => {
    return false;
  },
  onChangeIndex: () => {
    return false;
  }
};

SwipableComp.propTypes = {
  height: PropTypes.any,
  iconLeft: PropTypes.any,
  iconRight: PropTypes.any,
  position: PropTypes.string,
  vitesse: PropTypes.number,
  index: PropTypes.number,
  modif: PropTypes.bool,
  onChangeIndex: PropTypes.func,
  onChangepourc: PropTypes.func,
  resistance: PropTypes.bool,
  distance: PropTypes.any,
  childBgColor: PropTypes.string,
  contBgColor: PropTypes.string,
  decal: PropTypes.number,
  espace: PropTypes.number,
  navigation: PropTypes.bool
};
export default SwipableComp;
