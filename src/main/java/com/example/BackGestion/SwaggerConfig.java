package com.example.BackGestion;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuración global de Swagger / OpenAPI 3.
 * Swagger UI disponible en: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BackGestion API - Colegio")
                        .version("1.0.0")
                        .description("API REST para la gestión de docentes del schema **colegio** en MySQL. " +
                                "Permite realizar operaciones CRUD completas sobre la tabla `docente`.")
                        .contact(new Contact()
                                .name("Equipo BackGestion")
                                .email("contacto@colegio.cl"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor local de desarrollo")
                ));
    }
}
