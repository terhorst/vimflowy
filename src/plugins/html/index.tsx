import * as React from 'react'; // tslint:disable-line no-unused-variable

import { Token, RegexTokenizerSplitter, EmitFn, Tokenizer } from '../../assets/ts/utils/token_unfolder';
import { registerPlugin } from '../../assets/ts/plugins';

const htmlTypes: Array<string> = [
  'div',
  'span',
  'img',
  'table'
];

const htmlRegexParts: Array<string> = [];
htmlTypes.forEach((htmltype) => {
  htmlRegexParts.push(
    `<${htmltype}(.|\\n)*>(.|\\n)*</${htmltype}>`
  );
  // self-closing
  htmlRegexParts.push(
    `<${htmltype}(.|\\n)*/>`
  );
});
const htmlRegex = '(' + htmlRegexParts.map((part) => '(' + part + ')').join('|') + ')';

registerPlugin(
  {
    name: 'HTML',
    author: 'Jeff Wu',
    description: `
      Lets you inline the following html tags:
        ${ htmlTypes.map((htmltype) => '<' + htmltype + '>').join(' ') }
    `,
  },
  function(api) {
    api.registerHook('session', 'renderLineTokenHook', (tokenizer, info) => {
      if (info.has_cursor) {
        return tokenizer;
      }
      if (info.has_highlight) {
        return tokenizer;
      }
      return tokenizer.then(RegexTokenizerSplitter(
        new RegExp(htmlRegex),
        (token: Token, emit: EmitFn<React.ReactNode>, wrapped: Tokenizer) => {
          try {
            emit(<span
              key={`html-${token.index}`}
              dangerouslySetInnerHTML={{__html: token.text}}
            />);
          } catch (e) {
            if (e instanceof Error)
              api.session.showMessage(e.message, { text_class: 'error' });
            emit(...wrapped.unfold(token));
          }
        }
      ));
    });
  },
  (api => api.deregisterAll()),
);
