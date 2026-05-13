describe('Autenticacion', () => {

    beforeEach(() => {
        cy.visit('/auth/login')
    })

    it('Debe ingresar como docente', () => {
        cy.get('input[name="email"]').type('c.rodriguez@colegio.cl', { delay: 300 })
        cy.get('input[name="password"]').type('123', { delay: 300 })
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/docente')
        cy.wait(500)
    })

    it('Debe ingresar como administrador', () => {
        cy.get('input[name="email"]').type('admin@colegio.cl', { delay: 300 })
        cy.get('input[name="password"]').type('123', { delay: 300 })
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/admin')
        cy.wait(500)
    })

    it('Debe ingresar como Estudiante', () => {
        cy.get('input[name="email"]').type('sofia.gonzalez@colegio.cl', { delay: 300 })
        cy.get('input[name="password"]').type('123', { delay: 300 })
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/estudiante')
        cy.wait(500)
    })

    it('Debe mostrar error con credenciales invalidas',()=>{
        cy.get('input[name="email"]').type('usuario@gmail.com', { delay: 300 })
        cy.get('input[name="password"]').type('123', { delay: 300 })
        cy.get('button[type="submit"]').click()
        cy.contains('Error de inicio de sesión').should('be.visible')
    })

    it('No debe permitir ingresar a rutas protegidas sin autenticarse',()=>{
        cy.visit('/admin')
        cy.contains('No tienes acceso a esta vista').should('be.visible')
    })

})