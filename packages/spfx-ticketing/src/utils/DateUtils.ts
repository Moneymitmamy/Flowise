export const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) {
    return false;
  }
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
};

export const formatDateTime = (value?: string): string => {
  if (!value) {
    return '';
  }
  return new Date(value).toLocaleString('de-DE');
};
