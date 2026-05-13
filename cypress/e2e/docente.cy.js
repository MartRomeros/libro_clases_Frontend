describe('Docente', () => {

    beforeEach(() => {
        cy.visit('/auth/login')
        cy.get('input[name="email"]').type('c.rodriguez@colegio.cl')
        cy.get('input[name="password"]').type('123')
        cy.get('button[type="submit"]').click()
    })

    //Ver perfil
    it('Debe visualizar su perfil', () => {
        cy.get('.perfil-link').click()
        cy.contains('Datos Personales').should('be.visible')
        cy.contains('Contacto').should('be.visible')
        cy.contains('Información Docente').should('be.visible')

    })

    //Pasar asistencia
    it('Debe registrar asistencia a una clase', () => {
        cy.contains('Asistencia y Conducta').click()
        cy.contains('Asistencia y Conducta').should('be.visible')
        cy.get('mat-select').click();
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('mat-option').contains('1° Básico A').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('mat-select').should('contain', '1° Básico A');
        cy.wait(700) // Espera a que se carguen las opciones

        cy.get('input[matInput]')
            .clear()
            .type('11/05/2026')
            .blur();
        cy.wait(700) // Espera a que se carguen las opciones

        cy.get('.btn-marcar-todos').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('.btn-presente').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('.btn-guardar').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('.btn-registrar').click()
    })

    it('No debe registrar asistencia en dias fin de semana ni feriados', () => {
        cy.contains('Asistencia y Conducta').click()
        cy.contains('Asistencia y Conducta').should('be.visible')
        cy.get('mat-select').click();
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('mat-option').contains('1° Básico A').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('mat-select').should('contain', '1° Básico A');
        cy.wait(700) // Espera a que se carguen las opciones

        cy.get('input[matInput]')
            .clear()
            .type('10/05/2026')
            .blur();
        cy.wait(700) // Espera a que se carguen las opciones

        cy.get('.btn-marcar-todos').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('.btn-presente').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('.btn-guardar').click()
        cy.wait(700) // Espera a que se carguen las opciones
        cy.get('.btn-registrar').click()

        cy.get('.mat-mdc-snack-bar-container', { timeout: 5000 })
            .contains(' No se permiten fines de semana ni feriados de Chile.').should('be.visible');

    })

    



})