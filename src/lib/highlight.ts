/**
 * Мини-подсветка синтаксиса для слайдов. Не парсер — набор регулярок,
 * которого хватает для коротких учебных фрагментов. Работает построчно,
 * чтобы слайд мог подсвечивать/приглушать отдельные строки.
 */

export type Lang = 'ts' | 'sql' | 'prisma' | 'json' | 'bash' | 'http' | 'text';

export type TokenKind =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'comment'
  | 'fn'
  | 'type'
  | 'number'
  | 'deco'
  | 'prop';

export interface Token {
  text: string;
  kind: TokenKind;
}

type Rule = [RegExp, TokenKind];

const TS_KEYWORDS =
  'import|from|export|const|let|var|function|return|async|await|new|class|extends|implements|interface|type|public|private|readonly|if|else|throw|typeof|of|in|for|true|false|null|undefined|this|constructor|as|try|catch';

const SQL_KEYWORDS =
  'CREATE|TABLE|ALTER|ADD|COLUMN|DROP|INDEX|ON|PRIMARY|KEY|DEFAULT|NOT|NULL|REFERENCES|CONSTRAINT|FOREIGN|CHECK|IF|EXISTS|INSERT|INTO|VALUES|UPDATE|SET|WHERE|SELECT|FROM|ORDER|BY|DESC|ASC|LIMIT|OFFSET|RETURNING|DELETE|BEGIN|COMMIT|ROLLBACK|UNIQUE|CASCADE|TYPE|AND|OR|IN|AS|EXTENSION|TRUE|FALSE|JOIN|LEFT|COUNT';

const SQL_TYPES = 'UUID|VARCHAR|TEXT|NUMERIC|BOOLEAN|TIMESTAMP|INT|INTEGER|BIGINT|SERIAL';

const RULES: Record<Exclude<Lang, 'text' | 'http'>, Rule[]> = {
  ts: [
    [/\/\/.*$/, 'comment'],
    [/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/, 'string'],
    [/@\w+/, 'deco'],
    [new RegExp(`\\b(?:${TS_KEYWORDS})\\b`), 'keyword'],
    [/\b\d+(?:\.\d+)?\b/, 'number'],
    [/\b[A-Z][A-Za-z0-9_]*\b/, 'type'],
    [/\b[a-zA-Z_$][\w$]*(?=\s*\()/, 'fn'],
  ],
  sql: [
    [/--.*$/, 'comment'],
    [/'(?:[^']|'')*'/, 'string'],
    [/"[^"]*"/, 'type'],
    [new RegExp(`\\b(?:${SQL_TYPES})\\b`, 'i'), 'fn'],
    [new RegExp(`\\b(?:${SQL_KEYWORDS})\\b`, 'i'), 'keyword'],
    [/\b[a-z_]\w*(?=\s*\()/i, 'fn'],
    [/\$\d+|\b\d+(?:\.\d+)?\b/, 'number'],
  ],
  prisma: [
    [/\/\/.*$/, 'comment'],
    [/"(?:[^"\\]|\\.)*"/, 'string'],
    [/@@?[\w.]+/, 'deco'],
    [/\b(?:model|generator|datasource|enum)\b/, 'keyword'],
    [/\b[A-Z][A-Za-z0-9_]*\??(?:\[\])?/, 'type'],
    [/\b\d+(?:\.\d+)?\b/, 'number'],
  ],
  json: [
    [/"(?:[^"\\]|\\.)*"(?=\s*:)/, 'prop'],
    [/"(?:[^"\\]|\\.)*"/, 'string'],
    [/\b(?:true|false|null)\b/, 'keyword'],
    [/-?\b\d+(?:\.\d+)?\b/, 'number'],
    [/\/\/.*$/, 'comment'],
  ],
  bash: [
    [/#.*$/, 'comment'],
    [/^\$/, 'comment'],
    [/'[^']*'|"[^"]*"/, 'string'],
    [/\b(?:npm|npx|node|git|prisma)\b/, 'keyword'],
    [/(?<=\s)--?[\w-]+/, 'deco'],
  ],
};

const HTTP_REQUEST_LINE = /^(GET|POST|PUT|PATCH|DELETE)(\s+)(\S+)(.*)$/;
const HTTP_HEADER = /^([\w-]+)(:)(.*)$/;

function tokenize(line: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let rest = line;

  while (rest.length > 0) {
    let best: { index: number; text: string; kind: TokenKind } | null = null;

    for (const [re, kind] of rules) {
      const m = re.exec(rest);
      if (m && m[0].length > 0 && (best === null || m.index < best.index)) {
        best = { index: m.index, text: m[0], kind };
        if (m.index === 0) break;
      }
    }

    if (!best) {
      tokens.push({ text: rest, kind: 'plain' });
      break;
    }
    if (best.index > 0) tokens.push({ text: rest.slice(0, best.index), kind: 'plain' });
    tokens.push({ text: best.text, kind: best.kind });
    rest = rest.slice(best.index + best.text.length);
  }

  return tokens;
}

function tokenizeHttp(line: string, isFirst: boolean): Token[] {
  if (isFirst) {
    const m = HTTP_REQUEST_LINE.exec(line);
    if (m) {
      return [
        { text: m[1], kind: 'keyword' },
        { text: m[2], kind: 'plain' },
        { text: m[3], kind: 'fn' },
        { text: m[4], kind: 'comment' },
      ];
    }
  }
  const h = HTTP_HEADER.exec(line);
  if (h && !line.trimStart().startsWith('{') && !line.startsWith(' ')) {
    return [
      { text: h[1], kind: 'prop' },
      { text: h[2], kind: 'plain' },
      { text: h[3], kind: 'string' },
    ];
  }
  return tokenize(line, RULES.json);
}

/** Код → массив строк, каждая строка → токены. */
export function highlight(code: string, lang: Lang): Token[][] {
  const lines = code.replace(/\n$/, '').split('\n');
  if (lang === 'text') return lines.map((l) => [{ text: l, kind: 'plain' }]);
  if (lang === 'http') return lines.map((l, i) => tokenizeHttp(l, i === 0));

  const rules = RULES[lang];
  let inBlockComment = false;

  return lines.map((line) => {
    // Многострочные /** … */ — только для TS, построчно.
    if (lang === 'ts') {
      const trimmed = line.trimStart();
      if (inBlockComment || trimmed.startsWith('/*')) {
        inBlockComment = !trimmed.includes('*/');
        return [{ text: line, kind: 'comment' }];
      }
    }
    return tokenize(line, rules);
  });
}

export const TOKEN_CLASS: Record<TokenKind, string> = {
  plain: 'text-code-text',
  keyword: 'text-code-keyword',
  string: 'text-code-string',
  comment: 'text-code-comment italic',
  fn: 'text-code-fn',
  type: 'text-code-type',
  number: 'text-code-number',
  deco: 'text-code-deco',
  prop: 'text-code-prop',
};
