package com.example.BackGestion.Repository;

import com.example.BackGestion.Model.Usuario;
import com.example.BackGestion.dto.LoginProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    @Query(value = "SELECT nombre_usuario as nombreUsuario, nombre_rol as nombreRol FROM public.autenticar_y_obtener_info(:email, :password)", nativeQuery = true)
    Optional<LoginProjection> autenticarUsuario(@Param("email") String email, @Param("password") String password);
}

