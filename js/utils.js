// Utility functions for formatting and slider value extraction

// Format a number to 3 decimal places
export function fmt3(num) {
  return Number(num).toFixed(3);
}

// Get the value of a slider as a number
export function getSliderValue(id) {
  const el = document.getElementById(id);
  return el ? Number(el.value) : 0;
}
