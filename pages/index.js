import Head from "next/head";
import Image from "next/image";
import AnimatedCan from "@/components/AnimatedCan";

export default function Home() {
  return (
    <>
      <Head>
        <title>LIV Energy Water</title>
        <meta name="description" content="Energía refrescante, cero culpa." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/liv-logo.png" alt="LIV" width={36} height={36} />
            <span className="text-lg font-semibold tracking-tight">LIV Energy Water</span>
          </div>
          <nav className="hidden gap-8 text-sm text-gray-600 md:flex">
            <a href="#sabores" className="hover:text-gray-900">Sabores</a>
            <a href="#beneficios" className="hover:text-gray-900">Beneficios</a>
            <a href="#cta" className="hover:text-gray-900">Notificarme</a>
          </nav>
        </header>

        <section className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl">
              LIV Energy Water: <br/>Energía Refrescante, Cero Culpa
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-700">
              Descubrí la hidratación con un impulso de energía limpia.
            </p>
            <div className="mt-8">
              <a href="#sabores" className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:opacity-90">
                Explora los Sabores
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
            <AnimatedCan src="/images/raspberry-can.png" alt="Raspberry" label="Raspberry" delay={0.0} />
            <AnimatedCan src="/images/grape-can.png" alt="Grape" label="Grape" delay={0.1} />
            <AnimatedCan src="/images/lemon-can.png" alt="Lemon" label="Lemon" delay={0.2} />
            <AnimatedCan src="/images/blueberry-can.png" alt="Blueberry" label="Blueberry" delay={0.3} />
          </div>
        </section>

        <section id="sabores" className="mt-20 md:mt-28">
          <h2 className="mb-6 text-2xl font-semibold">Sabores</h2>
          <p className="mb-8 max-w-2xl text-gray-600">
            Latas transparentes, líquido claro como agua. Sabor real, sin azúcar, con la cafeína justa.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {['raspberry', 'grape', 'lemon', 'blueberry'].map((k) => (
              <div key={k} className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="relative mx-auto h-64 w-full">
                  <Image src={`/images/${k}-can.png`} alt={`${k} can`} fill className="object-contain" />
                </div>
                <div className="mt-2 text-center text-sm font-medium capitalize">{k}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="beneficios" className="mt-24">
          <h2 className="mb-6 text-2xl font-semibold">¿Por qué LIV?</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ["⚡️ Energía limpia", "Cafeína calibrada, sin azúcar."],
              ["💧 Hidratación real", "Agua + electrolitos ligeros."],
              ["🍃 Sabor natural", "Refresco claro y liviano."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-sm backdrop-blur">
                <div className="text-base font-medium">{title}</div>
                <div className="text-sm text-gray-600">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className="mt-24 rounded-3xl border border-gray-200 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
          <h3 className="text-xl font-semibold">¿Querés que te avisemos cuando lancemos?</h3>
          <p className="mt-2 text-gray-600">Dejá tu email y sé de los primeros.</p>
          <form className="mx-auto mt-5 flex max-w-xl gap-3">
            <input type="email" required placeholder="Ingresá tu email"
              className="flex-1 rounded-2xl border border-gray-300 px-5 py-3 outline-none focus:ring-2 focus:ring-violet-400" />
            <button className="rounded-2xl bg-violet-600 px-6 font-semibold text-white hover:bg-violet-500">
              Notificarme
            </button>
          </form>
        </section>

        <div className="fixed bottom-6 right-6 sparkle" />
      </main>

      <footer className="mt-16 border-t border-gray-200/70 bg-white/60 py-8 text-center text-sm text-gray-600 backdrop-blur">
        © {new Date().getFullYear()} LIV Energy Water
      </footer>
    </>
  );
}
