describe('App angular', () => {
  it('Debe visualizar la pagina principal', () => {
    cy.visit('/');    
    cy.contains("O'Higgins").should('be.visible');
  })
})