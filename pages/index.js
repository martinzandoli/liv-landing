export default function Home() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,            // top:0 right:0 bottom:0 left:0
        background: '#f3f4f6' // color de fondo (cámbialo si querés)
      }}
    >
      <img
        src="/hero.png"       // o el nombre que subiste a /public
        alt="LIV Energy Water"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',  // 👈 muestra la imagen completa
          objectPosition: 'center'
        }}
      />
    </div>
  );
}


