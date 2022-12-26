// @ts-nocheck
export const formatHoursMinutes = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const hoursString = hours > 0 ? `${hours}h ` : '';
  const minutesString = `${minutes}m`;
  return hoursString + minutesString;
};

export const formatDaysHoursMinutes = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const hoursString = hours > 0 ? `${hours}h ` : '';
  const minutesString = `${minutes}m`;
  return hoursString + minutesString;
};
