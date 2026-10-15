import { describe, expect, it } from 'vitest';

import { thymeleafMailToHandlebars } from './mail-templates.js';

describe('the mail templates of JHipster Spring Boot as Handlebars', () => {
  it('should convert the expressions of an account mail', () => {
    const thymeleaf = `<html xmlns:th="http://www.thymeleaf.org" th:lang="\${#locale.language}" lang="en">
  <head>
    <title th:text="#{email.activation.title}">JHipster activation</title>
    <link rel="icon" th:href="@{|\${baseUrl}/favicon.ico|}" />
  </head>
  <body>
    <p th:text="#{email.activation.greeting(\${user.login})}">Dear</p>
    <a th:with="url=(@{|\${baseUrl}/account/activate?key=\${user.activationKey}|})" th:href="\${url}" th:text="\${url}">Activation link</a>
    <p th:text="#{email.reset.text1}">
      For your account a password reset was requested
    </p>
  </body>
</html>`;

    expect(thymeleafMailToHandlebars(thymeleaf)).toBe(`<html lang="{{langKey}}">
  <head>
    <title>{{message 'email.activation.title'}}</title>
    <link rel="icon" href="{{baseUrl}}/favicon.ico" />
  </head>
  <body>
    <p>{{message 'email.activation.greeting' user.login}}</p>
    <a href="{{baseUrl}}/account/activate?key={{user.activationKey}}">{{baseUrl}}/account/activate?key={{user.activationKey}}</a>
    <p>{{message 'email.reset.text1'}}</p>
  </body>
</html>`);
  });

  it('should fail on an expression it does not convert', () => {
    expect(() => thymeleafMailToHandlebars('<p th:text="${#dates.format(user.createdDate)}">date</p>')).toThrow(
      'Unsupported Thymeleaf expression',
    );
  });

  it('should fail on a th:text of an element with children', () => {
    expect(() => thymeleafMailToHandlebars('<p th:text="#{email.signature}"><em>JHipster</em></p>')).toThrow('with children');
  });

  it('should fail on a Thymeleaf attribute it leaves', () => {
    expect(() => thymeleafMailToHandlebars('<p th:each="item : ${items}">item</p>')).toThrow('Unsupported Thymeleaf expression');
  });
});
