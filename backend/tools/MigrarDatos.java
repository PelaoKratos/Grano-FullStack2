import java.sql.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

// Se ejecuta aparte de Spring para abrir H2 solo en modo lectura.
public class MigrarDatos {
  static final List<String> TABLAS = List.of("usuarios", "categorias", "productos",
      "pedidos", "pedido_productos", "mensajes", "marcas_iniciales");

  static String variable(String nombre, String defecto) {
    return System.getenv().getOrDefault(nombre, defecto);
  }

  public static void main(String[] argumentos) throws Exception {
    boolean aplicar = Arrays.asList(argumentos).contains("--aplicar");
    try (Connection origen = DriverManager.getConnection(
            variable("GRANO_H2_URL", "jdbc:h2:file:./data/grano;IFEXISTS=TRUE;ACCESS_MODE_DATA=r"),
            variable("GRANO_H2_USER", "sa"), variable("GRANO_H2_PASSWORD", ""));
        Connection destino = DriverManager.getConnection(
            variable("GRANO_DB_URL", "jdbc:postgresql://localhost:5432/grano"),
            variable("GRANO_DB_USER", "grano"), variable("GRANO_DB_PASSWORD", "grano_local_2026"))) {
      if (!destino.getMetaData().getDatabaseProductName().equals("PostgreSQL")) {
        throw new IllegalStateException("El destino debe ser PostgreSQL.");
      }
      origen.setAutoCommit(false);
      destino.setAutoCommit(false);
      try {
        // Nadie puede cambiar estas tablas mientras comparamos y copiamos.
        try (Statement s = destino.createStatement()) {
          s.execute("SET LOCAL lock_timeout = '5s'");
          s.execute("LOCK TABLE " + String.join(",", TABLAS) + " IN EXCLUSIVE MODE");
        }
        Map<String, String> cuentas = new HashMap<>();
        for (String tabla : TABLAS) copiar(origen, destino, tabla, cuentas);
        if (aplicar) {
          destino.commit();
          System.out.println("Migración confirmada. Los datos de H2 siguen conservados.");
        } else {
          destino.rollback();
          System.out.println("Simulación terminada. No se guardaron cambios en PostgreSQL.");
        }
      } catch (Exception error) {
        destino.rollback();
        // No imprimimos filas, correos ni hashes en los informes.
        System.err.println("Se canceló toda la copia. PostgreSQL conserva sus datos anteriores.");
        throw error;
      } finally {
        origen.rollback();
      }
    }
  }

  static List<Map<String, Object>> leer(Connection conexion, String tabla) throws SQLException {
    List<Map<String, Object>> filas = new ArrayList<>();
    try (Statement s = conexion.createStatement(); ResultSet r = s.executeQuery("SELECT * FROM " + tabla)) {
      ResultSetMetaData m = r.getMetaData();
      while (r.next()) {
        Map<String, Object> fila = new LinkedHashMap<>();
        for (int i = 1; i <= m.getColumnCount(); i++) {
          String columna = m.getColumnName(i).toLowerCase(Locale.ROOT);
          Object valor;
          // Hibernate guarda @Lob como CLOB en H2 y como objeto grande en PostgreSQL.
          if (columna.equals("imagen")) {
            Clob imagen = r.getClob(i);
            valor = imagen == null ? null : imagen.getSubString(1, Math.toIntExact(imagen.length()));
            if (imagen != null) imagen.free();
          } else {
            valor = r.getObject(i);
            if (valor instanceof java.time.OffsetDateTime fecha) valor = fecha.toInstant();
          }
          fila.put(columna, valor);
        }
        filas.add(fila);
      }
    }
    return filas;
  }

  static List<String> claves(String tabla) {
    if (tabla.equals("pedido_productos")) return List.of("pedido_id", "posicion");
    return List.of(tabla.equals("marcas_iniciales") ? "nombre" : "id");
  }

  static boolean mismo(Map<String, Object> a, Map<String, Object> b, List<String> columnas) {
    return columnas.stream().allMatch(c -> Objects.equals(a.get(c), b.get(c)));
  }

  static void copiar(Connection origen, Connection destino, String tabla, Map<String, String> cuentas)
      throws SQLException {
    List<Map<String, Object>> anteriores = leer(destino, tabla);
    int nuevas = 0, existentes = 0;
    for (Map<String, Object> fila : leer(origen, tabla)) {
      if (tabla.equals("pedidos")) fila.computeIfPresent("comprador", (c, id) -> cuentas.getOrDefault(id, id.toString()));
      Map<String, Object> actual = anteriores.stream()
          .filter(f -> mismo(f, fila, claves(tabla))).findFirst().orElse(null);
      if (tabla.equals("usuarios")) {
        Map<String, Object> porCorreo = anteriores.stream()
            .filter(f -> Objects.equals(f.get("correo"), fila.get("correo"))).findFirst().orElse(null);
        // Conservamos la cuenta demo del destino y adaptamos al comprador de sus pedidos.
        if (porCorreo != null && Boolean.TRUE.equals(fila.get("cuenta_demostracion"))
            && Boolean.TRUE.equals(porCorreo.get("cuenta_demostracion"))
            && Objects.equals(fila.get("rol"), porCorreo.get("rol"))) {
          if (actual != null && actual != porCorreo) throw conflicto(tabla);
          cuentas.put(fila.get("id").toString(), porCorreo.get("id").toString());
          existentes++;
          continue;
        }
        if (porCorreo != null && actual != porCorreo) throw conflicto(tabla);
      }
      if (actual != null) {
        if (!mismo(actual, fila, new ArrayList<>(fila.keySet()))) throw conflicto(tabla);
        existentes++;
        continue;
      }
      insertar(destino, tabla, fila);
      anteriores.add(fila);
      nuevas++;
    }
    System.out.printf("%s: %d por copiar, %d ya existentes.%n", tabla, nuevas, existentes);
  }

  static SQLException conflicto(String tabla) {
    return new SQLException("Hay registros distintos con la misma identidad en " + tabla
        + ". Hay que revisar el conflicto antes de aplicar.");
  }

  static void insertar(Connection destino, String tabla, Map<String, Object> fila) throws SQLException {
    List<String> columnas = new ArrayList<>(fila.keySet());
    List<String> valores = columnas.stream().map(c -> c.equals("imagen")
        ? "lo_from_bytea(0, ?)" : "?").toList();
    String sql = "INSERT INTO " + tabla + " (" + String.join(",", columnas) + ") VALUES ("
        + String.join(",", valores) + ")";
    try (PreparedStatement s = destino.prepareStatement(sql)) {
      for (int i = 0; i < columnas.size(); i++) {
        String columna = columnas.get(i);
        Object valor = fila.get(columna);
        if (columna.equals("imagen")) {
          s.setBytes(i + 1, valor == null ? null : valor.toString().getBytes(StandardCharsets.UTF_8));
        } else if (valor instanceof java.time.Instant fecha) {
          s.setObject(i + 1, fecha.atOffset(java.time.ZoneOffset.UTC));
        } else s.setObject(i + 1, valor);
      }
      s.executeUpdate();
    } catch (SQLException error) {
      // El detalle del driver podría incluir contraseñas cifradas o datos personales.
      throw new SQLException("No se pudo copiar " + tabla + " (SQLState " + error.getSQLState()
          + "). Revisa duplicados o diferencias de esquema.");
    }
  }
}
