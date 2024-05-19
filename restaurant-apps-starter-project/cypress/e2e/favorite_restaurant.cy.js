describe('Favorite Restaurant End-to-End Tests', () => {
  beforeEach(() => {
    cy.visit('/detail.html?id=rqdv5juczeskfw1e867');
  });

  it('allows a user to add a restaurant to favorites', () => {
    // Simulate user action to add a restaurant to favorites
    cy.get('.restaurant-detail-card button').click();

    // Assertion to check if the button's text has changed
    if (!cy.url().should('include', '/favorites.html')) {
      cy.get('.restaurant-detail-card button').should(
        'have.text',
        'Remove from Favorites',
      );
    }
  });

  it('allows a user to remove a restaurant from favorites', () => {
    // First add to favorites
    cy.get('.restaurant-detail-card button').click();

    // Then simulate user action to remove a restaurant from favorites
    cy.get('.restaurant-card > button').click();

    // restaurant list should be empty
    cy.get('.restaurant-card > button').should('not.exist');
  });
});
