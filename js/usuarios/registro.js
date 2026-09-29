// Esta página registra los datos en el navegador para la maqueta.
(() => {
  const formulario = document.querySelector("#formulario-registro");
  if (!formulario) return;

  const campoRut = formulario.querySelector("#rut");
  const mensajeRut = formulario.querySelector("#mensaje-rut");
  const estado = formulario.querySelector("#estado-registro");
  const claveUsuarios = "usuarios-grano";

  function mostrarEstado(texto, correcto) {
    estado.textContent = texto;
    estado.classList.toggle("text-success", correcto);
    estado.classList.toggle("text-danger", !correcto);
  }

  campoRut.addEventListener("blur", () => {
    const valido = window.Grano.rut.esValido(campoRut.value);
    campoRut.classList.toggle("is-valid", valido);
    campoRut.classList.toggle("is-invalid", !valido && campoRut.value.length > 0);
    mensajeRut.textContent = valido ? "RUT válido." : "Revisa el RUT y su dígito verificador.";
    mensajeRut.classList.toggle("text-success", valido);
    mensajeRut.classList.toggle("text-danger", !valido && campoRut.value.length > 0);

    if (valido) campoRut.value = window.Grano.rut.formatear(campoRut.value);
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity() || !window.Grano.rut.esValido(campoRut.value)) {
      formulario.classList.add("was-validated");
      campoRut.classList.add("is-invalid");
      mensajeRut.textContent = "Ingresa un RUT válido con un solo dígito verificador.";
      mostrarEstado("Revisa los campos del formulario.", false);
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem(claveUsuarios)) || [];
    const rutFormateado = window.Grano.rut.formatear(campoRut.value);
    const correo = formulario.querySelector("#correo").value.trim().toLowerCase();
    const existe = usuarios.some((usuario) => usuario.rut === rutFormateado || usuario.correo === correo);

    if (existe) {
      mostrarEstado("Ya existe una cuenta con ese RUT o correo en este navegador.", false);
      return;
    }

    usuarios.push({
      nombre: formulario.querySelector("#nombre").value.trim(),
      rut: rutFormateado,
      correo,
    });
    localStorage.setItem(claveUsuarios, JSON.stringify(usuarios));
    formulario.reset();
    campoRut.classList.remove("is-valid", "is-invalid");
    mensajeRut.textContent = "";
    mostrarEstado("Cuenta creada y guardada en este navegador.", true);
  });
})();
