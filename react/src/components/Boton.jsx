function Boton({
  children,
  variant = "primario",
  type = "button",
  href,
  className = "",
  onClick,
  disabled = false,
  ...props
}) {
  const classes = ["boton", `boton-${variant}`, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Boton;
