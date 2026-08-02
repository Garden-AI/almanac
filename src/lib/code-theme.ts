// Paper-and-ink syntax theme for run snippets, colorway aligned with the
// page tokens. Shared by the index How-To and model-page Running sections.
export const almanacCodeTheme = {
  name: 'almanac',
  type: 'light' as const,
  bg: 'rgba(26,22,18,0.035)',
  fg: '#1f1c18',
  settings: [
    { settings: { foreground: '#1f1c18', background: 'rgba(26,22,18,0.035)' } },
    { scope: ['comment', 'comment.line', 'comment.block', 'punctuation.definition.comment'],
      settings: { foreground: '#7a7268', fontStyle: 'italic' } },
    { scope: ['keyword', 'keyword.control', 'keyword.operator.expression', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#7a1f1f' } },
    { scope: ['string', 'string.quoted', 'string.quoted.single', 'string.quoted.double', 'punctuation.definition.string'],
      settings: { foreground: '#5a1414' } },
    { scope: ['constant.numeric', 'constant.language'],
      settings: { foreground: '#5a1414' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'],
      settings: { foreground: '#1f1c18', fontStyle: 'bold' } },
    { scope: ['entity.name.class', 'support.class'],
      settings: { foreground: '#1f1c18', fontStyle: 'bold' } },
    { scope: ['variable.parameter.function-call', 'variable.parameter'],
      settings: { foreground: '#4a4540' } },
    { scope: ['punctuation', 'meta.brace', 'punctuation.separator'],
      settings: { foreground: '#4a4540' } },
  ],
};
