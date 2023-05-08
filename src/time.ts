const secondsPerMinute = 60;
const secondsPerHour = 60 * secondsPerMinute;
const secondsPerDay = 24 * secondsPerHour;
const secondsPerMonth = 30 * secondsPerDay;
const secondsPerYear = 365 * secondsPerDay;

const elapsedTime = (unix: number): string | undefined => {
  const updatedAt = new Date(unix * 1000).getTime();
  if (updatedAt === undefined) return;

  const now = new Date().getTime();
  const seconds = (now - updatedAt) / 1000;

  if (seconds < 20) {
    return "just now";
  }

  if (seconds < secondsPerMinute) {
    return "few seconds ago";
  }

  const scaleTime = (scale: number): number => {
    return Math.floor(seconds / scale);
  };

  if (seconds < secondsPerHour) {
    const total = scaleTime(secondsPerMinute);
    return `${total} minute${total > 1 ? "s" : ""} ago`;
  }

  if (seconds < secondsPerDay) {
    const total = scaleTime(secondsPerHour);
    return `${total} hour${total > 1 ? "s" : ""} ago`;
  }

  if (seconds < secondsPerMonth) {
    const total = scaleTime(secondsPerDay);
    return `${total} day${total > 1 ? "s" : ""} ago`;
  }

  if (seconds < secondsPerYear) {
    const total = scaleTime(secondsPerMonth);
    return `${total} month${total > 1 ? "s" : ""} ago`;
  }

  const total = scaleTime(secondsPerYear);
  return `${total} year${total > 1 ? "s" : ""} ago`;
};

export { elapsedTime };
