import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import CanStory from "@/components/CanStory";
import Teanina from "@/components/Teanina";
import Formula from "@/components/Formula";
import Momentos from "@/components/Momentos";
import VideoFilm from "@/components/VideoFilm";
import Sabores from "@/components/Sabores";
import Comunidad from "@/components/Comunidad";
import Faq from "@/components/Faq";
import Cierre from "@/components/Cierre";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <CanStory />
        <Teanina />
        <Formula />
        <Momentos />
        <VideoFilm />
        <Sabores />
        <Comunidad />
        <Faq />
      </main>
      <Cierre />
    </>
  );
}
