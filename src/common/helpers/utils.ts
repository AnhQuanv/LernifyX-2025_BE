const pad = (n: number): string => n.toString().padStart(2, '0');
export const formatDate = (date: Date): string => {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};
