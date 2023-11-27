import Sutra from './lib/Sutra.js';
let sutra = {};
sutra.Sutra = Sutra;
sutra.createSutra = function () {
  return new Sutra();
};
export default sutra;