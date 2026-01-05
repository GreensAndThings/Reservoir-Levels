// currently selected region
// this variable stores the ID of the region that is currently selected.
// when no region is selected, it is null
let selectedRegion = null;

// functions that will be called when the region changes
// this array stores all the "listener" functions that want to be notified
// whenever the selected region changes
const listeners = [];

/**
 * setRegion(regionId)
 * updates the currently selected region and notifies all listeners
 * @param {string|null} regionId - the ID of the region to select,
 *                                 or null to deselect
 */
export function setRegion(regionId) {
  // update the selectedRegion variable with the new region
  selectedRegion = regionId;

  // notify all listener functions in the listeners array
  // each listener receives the new regionId as a parameter
  listeners.forEach(fn => fn(regionId));
}

/**
 * onRegionChange(fn)
 * registers a function to run whenever the selected region changes
 * @param {function} fn - a callback function that takes the regionId as a parameter
 */
export function onRegionChange(fn) {
  // add the provided function to the listeners array
  // it will be called every time setRegion() is called
  listeners.push(fn);
}