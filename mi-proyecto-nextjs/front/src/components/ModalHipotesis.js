export default function ModalHipotesis({ isOpen, onClose, hipotesis }) {
  if (!isOpen || !hipotesis) return null;

  return (
    <div className={styles.modal}>
      <h1>Hipótesis realizada</h1>

      <p><strong>Jugador:</strong> {hipotesis.playerName}</p>
      <p><strong>Sospechoso:</strong> {hipotesis.sospechoso}</p>
      <p><strong>Arma:</strong> {hipotesis.arma}</p>
      <p><strong>Habitación:</strong> {hipotesis.habitacion}</p>

      <button onClick={onClose}>Cerrar</button>
    </div>
  )
}
