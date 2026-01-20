import { parseTicketIdFromSubject, formatTicketSubject } from '../src/utils/TicketIdUtils';

describe('TicketIdUtils', () => {
  it('parses ticket id from subject', () => {
    const result = parseTicketIdFromSubject('[CS-2026-000123] Anfrage');
    expect(result).toBe('CS-2026-000123');
  });

  it('formats subject with ticket id', () => {
    const result = formatTicketSubject('CS-2026-000123', 'Test');
    expect(result).toBe('[CS-2026-000123] Test');
  });
});
