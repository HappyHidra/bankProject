/// <reference types="cypress" />
describe('Общий тест', () => {
  it('Данные для входа', () => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox').blur();
  });

  it('Авторизация произошла успешно', () => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox').blur();
    cy.get('#loginBtn').click();
    cy.get('.your-bills-title').should('contain.text', 'Ваши счета');
  });

  it('Создание счёта прошло успешно', () => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox').blur();
    cy.get('#loginBtn').click();
    cy.get('.createNewBillBtn').click();
    cy.get('.your-bills-title').should('contain.text', 'Ваши счета');
  });

  it('Открыть историю счёта успешно ', () => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox').blur();
    cy.get('#loginBtn').click();

    cy.get('body').then(($body) => {
      if ($body.find('.bills-btn')) {
        cy.get('.bills-btn').first().click();
        cy.get('.bill-header').should('contain.text', 'Просмотр счёта');
      }
    });
  });

  it('Перевод успешно', () => {
    cy.visit('http://localhost:8080');
    cy.get('#login').type('developer');
    cy.get('#password').type('skillbox').blur();
    cy.get('#loginBtn').click();
    cy.get('.bills-btn').first().click();
    cy.get('#transferToBill').type('31363375527714578733202074');
    cy.get('#transferAmount').type('777').blur();
    cy.get('#sendBtn').click();
    cy.wait(500);
    cy.get('.form-history-wrapper').contains('777');
  });
});
