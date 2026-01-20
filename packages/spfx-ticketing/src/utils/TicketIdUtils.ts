export const TICKET_ID_REGEX = /\[(?<ticketId>[A-Z]{2,}-\d{4}-\d{6})\]/;

export const parseTicketIdFromSubject = (subject: string): string | null => {
  if (!subject) {
    return null;
  }
  const match = subject.match(TICKET_ID_REGEX);
  return match?.groups?.ticketId ?? null;
};

export const formatTicketSubject = (ticketId: string, originalSubject: string): string => {
  const normalizedSubject = originalSubject?.trim() || 'Ohne Betreff';
  return `[${ticketId}] ${normalizedSubject}`;
};

export const buildTicketId = (prefix: string, sequence: number, date = new Date()): string => {
  const year = date.getFullYear();
  const seq = sequence.toString().padStart(6, '0');
  return `${prefix}${year}-${seq}`;
};
