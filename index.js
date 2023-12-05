import Sutra from './lib/sutra.js';
let sutra = {};
sutra.Sutra = Sutra;
sutra.createSutra = function () {
  return new Sutra();
};
export default sutra;