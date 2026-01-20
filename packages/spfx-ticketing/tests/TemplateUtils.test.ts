import { applyTemplate } from '../src/utils/TemplateUtils';

describe('TemplateUtils', () => {
  it('replaces placeholders', () => {
    const template = 'Hallo {Name}, Ticket {TicketId}';
    const result = applyTemplate(template, { Name: 'Alex', TicketId: 'CS-2026-000123' });
    expect(result).toBe('Hallo Alex, Ticket CS-2026-000123');
  });
});
