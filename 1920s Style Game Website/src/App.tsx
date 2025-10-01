import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Story } from "./components/Story";
import { Features } from "./components/Features";
import { GameMechanics } from "./components/GameMechanics";
import { Gallery } from "./components/Gallery";
import { Download } from "./components/Download";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="size-full bg-[#0a0a0a] text-[#f4f1eb] gangster-atmosphere">
      <Header />
      <Hero />
      <Story />
      <Features />
      <GameMechanics />
      <Gallery />
      <Download />
      <Footer />
    </div>
  );
}