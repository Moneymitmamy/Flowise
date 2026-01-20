export interface ITemplateContext {
  [key: string]: string | undefined;
}

export const applyTemplate = (template: string, context: ITemplateContext): string => {
  if (!template) {
    return '';
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    return context[key] ?? '';
  });
};
