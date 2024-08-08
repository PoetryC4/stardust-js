import './style.css'
import {starTrailsInit} from "./examples/star_trails.js";
import {fallingSnowflakeInit} from "./examples/falling_snow.js";
import {movingEffectInit} from "./examples/move_effect.js";
import {clickEffectInit} from "./examples/click_effect.js";
import {fireworkInit} from "./examples/firework.js";
import {risingPixieInit} from "./examples/rising_pixie.js";

document.querySelector('#app').innerHTML = `
  <div id="hello_view">
  </div>
`

fallingSnowflakeInit().then(r => console.log("init ok"))