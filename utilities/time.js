function getDaysFromMilliseconds(milliseconds) {
  const days = Math.floor(milliseconds / 24 / 60 / 60 / 1000);
  return days;
}

export default getDaysFromMilliseconds;
