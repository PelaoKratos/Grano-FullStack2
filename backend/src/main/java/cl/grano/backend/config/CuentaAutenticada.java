package cl.grano.backend.config;

import cl.grano.backend.model.Usuario;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;

// Un número de versión permite cerrar sesiones viejas sin guardar la contraseña en ellas.
public class CuentaAutenticada extends User {
  public final int versionSesion;
  public CuentaAutenticada(Usuario usuario) {
    super(usuario.correo, usuario.contrasenaHash, usuario.activo, true, true, true,
        AuthorityUtils.createAuthorityList("ROLE_" + usuario.rol));
    versionSesion = usuario.versionSesion;
  }
}
