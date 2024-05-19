Cypress.Commands.add('login', (email, password) => {
  // Custom command to encapsulate logging into the application
  cy.get('input[name=email]').type(email);
  cy.get('input[name=password]').type(password);
  cy.get('form').submit();
});
