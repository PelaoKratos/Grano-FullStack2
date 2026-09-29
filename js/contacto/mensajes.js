// Esta página guarda los mensajes de contacto en el navegador.
(() => {
  const formulario = document.querySelector("#formulario-contacto");
  if (!formulario) return;

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const estado = formulario.querySelector("#estado-mensaje");

    if (!formulario.reportValidity()) return;

    const mensajes = JSON.parse(localStorage.getItem("mensajes-grano")) || [];
    mensajes.push({
      nombre: formulario.querySelector("#nombre").value.trim(),
      correo: formulario.querySelector("#correo").value.trim(),
      mensaje: formulario.querySelector("#mensaje").value.trim(),
      fecha: new Date().toISOString(),
    });
    localStorage.setItem("mensajes-grano", JSON.stringify(mensajes));
    formulario.reset();
    estado.textContent = "Mensaje guardado en este navegador.";
    estado.classList.add("text-success");
  });
})();
