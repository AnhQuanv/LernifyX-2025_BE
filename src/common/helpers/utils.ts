export const formatDate = (date: Date): string => {
  const vnTime = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );

  const pad = (n: number): string => n.toString().padStart(2, '0');

  return (
    vnTime.getFullYear().toString() +
    pad(vnTime.getMonth() + 1) +
    pad(vnTime.getDate()) +
    pad(vnTime.getHours()) +
    pad(vnTime.getMinutes()) +
    pad(vnTime.getSeconds())
  );
};
