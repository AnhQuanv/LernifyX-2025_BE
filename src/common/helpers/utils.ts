import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

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

export const formatToSqlDateTime = (date: Date): string => {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

export const applyTimeFilter = <T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  range: string,
  start?: string,
  end?: string,
) => {
  const rangeType = range?.toLowerCase() || 'all';
  const now = new Date();

  if (rangeType === 'today') {
    const s = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const e = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    query.andWhere('payment.paid_at BETWEEN :start AND :end', {
      start: formatToSqlDateTime(s),
      end: formatToSqlDateTime(e),
    });
  } else if (rangeType === 'custom' && start && end) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);

    query.andWhere('payment.paid_at BETWEEN :start AND :end', {
      start: formatToSqlDateTime(s),
      end: formatToSqlDateTime(e),
    });
  } else if (rangeType === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    query.andWhere('payment.paid_at >= :start', {
      start: formatToSqlDateTime(startOfMonth),
    });
  } else if (rangeType === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    query.andWhere('payment.paid_at >= :start', {
      start: formatToSqlDateTime(startOfYear),
    });
  } else if (rangeType !== 'all') {
    const days = rangeType === '7d' ? 7 : rangeType === '30d' ? 30 : 0;
    if (days > 0) {
      const startDate = new Date();
      startDate.setDate(now.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      query.andWhere('payment.paid_at >= :startDate', {
        startDate: formatToSqlDateTime(startDate),
      });
    }
  }
};
