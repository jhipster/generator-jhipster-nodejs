/**
 * A Thymeleaf expression of the mail templates of JHipster Spring Boot as Handlebars: a message (#{key(${a.b})}) as the
 * message helper of the server, a variable (${a.b}), a link with literal substitutions (@{|${baseUrl}/path|}), the
 * language of the mail (${#locale.language}). The variables of a th:with give their converted value.
 */
const toHandlebarsValue = (expression, variables) => {
  const value = expression.trim();
  if (value === '${#locale.language}') return '{{langKey}}';
  let match = /^\$\{([\w.]+)\}$/.exec(value);
  if (match) {
    return variables[match[1]] ?? `{{${match[1]}}}`;
  }
  match = /^#\{([\w.]+)(?:\((.*)\))?\}$/.exec(value);
  if (match) {
    const parameters = (match[2] ?? '')
      .split(',')
      .map(parameter => parameter.trim())
      .filter(Boolean)
      .map(parameter => {
        const variable = /^\$\{([\w.]+)\}$/.exec(parameter);
        if (!variable) throw new Error(`Unsupported message parameter ${parameter}`);
        return ` ${variable[1]}`;
      });
    return `{{message '${match[1]}'${parameters.join('')}}}`;
  }
  match = /^\(?@\{\|(.*)\|\}\)?$/.exec(value);
  if (match) {
    return match[1].replace(/\$\{([\w.]+)\}/g, (_, variable) => variables[variable] ?? `{{${variable}}}`);
  }
  throw new Error(`Unsupported Thymeleaf expression ${value}`);
};

/** The attributes of a tag with their th: attributes converted, and the converted th:text if any. */
const convertAttributes = attributesText => {
  const attributes = [...attributesText.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => ({ name, value }));
  const variables = {};
  for (const { value } of attributes.filter(attribute => attribute.name === 'th:with')) {
    for (const definition of value.split(/,(?![^(]*\))/)) {
      const [, variable, expression] = /^\s*(\w+)\s*=\s*(.*)$/.exec(definition) ?? [];
      if (!variable) throw new Error(`Unsupported th:with ${value}`);
      variables[variable] = toHandlebarsValue(expression, variables);
    }
  }
  let text;
  const kept = [];
  for (const { name, value } of attributes) {
    if (name === 'th:with' || name.startsWith('xmlns:th')) continue;
    if (name === 'th:text') {
      text = toHandlebarsValue(value, variables);
    } else if (name.startsWith('th:')) {
      kept.push({ name: name.substring(3), value: toHandlebarsValue(value, variables) });
    } else if (!attributes.some(attribute => attribute.name === `th:${name}`)) {
      kept.push({ name, value });
    }
  }
  return { attributes: kept.map(({ name, value }) => ` ${name}="${value}"`).join(''), text };
};

/**
 * Converts a mail template of JHipster Spring Boot (Thymeleaf) to a Handlebars template of the mail module, for the
 * subset its account mails use: th:text on the elements without children, the other th: attributes (th:href, th:lang)
 * and the th:with variables. The output only interpolates values, escaped, and calls the message helper: it runs no
 * code. An expression or an attribute out of that subset fails the generation instead of giving a broken template.
 */
export const thymeleafMailToHandlebars = content => {
  const result = content
    // The leaf elements with a th:text, their content replaced by its value.
    .replace(/<(\w+)((?:\s+[\w:-]+="[^"]*")*)\s*>[^<]*<\/\1>/g, (element, tag, attributesText) => {
      if (!attributesText.includes('th:text=')) return element;
      const { attributes, text } = convertAttributes(attributesText);
      return `<${tag}${attributes}>${text}</${tag}>`;
    })
    // The other tags with th: attributes.
    .replace(/<(\w+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g, (tag, name, attributesText, selfClosing) => {
      if (!attributesText.includes('th:')) return tag;
      const { attributes, text } = convertAttributes(attributesText);
      if (text !== undefined) throw new Error(`Unsupported th:text on the element ${name} with children`);
      return `<${name}${attributes}${selfClosing ? ' /' : ''}>`;
    });
  if (/\sth:|xmlns:th/.test(result)) throw new Error('Unsupported Thymeleaf attribute left in the mail template');
  return result;
};
