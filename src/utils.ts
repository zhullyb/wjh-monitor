export const getCurrentTimeStr = () => {
  return new Date().toLocaleString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });
};

/**
 * Check if the time is between 0:00 and 6:20 in the East Eight Time Zone.
 */
export const isExemptionTime = () => {
  const now = new Date();

  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();

  const eastEightHours = (utcHours + 8) % 24;
  const eastEightMinutes = utcMinutes;

  return (eastEightHours >= 0 && eastEightHours < 6) || (eastEightHours === 6 && eastEightMinutes < 20);
};
