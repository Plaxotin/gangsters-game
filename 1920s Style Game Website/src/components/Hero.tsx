import { Button } from "./ui/button";
import { Play, Download } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1737923336824-7333a401ecb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwxOTIwcyUyMGNoaWNhZ28lMjBza3lsaW5lJTIwdmludGFnZXxlbnwxfHx8fDE3NTg5NjQzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="1920s Chicago skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#0a0a0a]/50 to-[#1e2a3a]/30"></div>
      </div>
      
      {/* Art Deco border decoration */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#3a4a5a] to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-transparent via-[#8b2635] to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-transparent via-[#8b2635] to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-block px-6 py-3 bg-[#2e2e2e]/20 border-2 border-[#d4af37]/60 rounded-sm mb-6 art-deco-corner">
            <span className="text-[#d4af37] tracking-wider font-medium">REVOLUTIONARY MOBILE MMO</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-[#f4f1eb] mb-6 tracking-wider">
          <span className="block text-[#d4af37] drop-shadow-lg font-serif">GANGSTERS</span>
          <span className="block text-3xl md:text-5xl mt-4 text-[#f4f1eb] font-sans font-light tracking-widest">REAL CITY</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[#f4f1eb] mb-10 max-w-3xl mx-auto leading-relaxed font-light">
          Capture real establishments in your city. Build criminal empires using GPS technology. 
          Fight for territory in the ultimate location-based strategy game.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-[#3a4a5a] to-[#2a3a4a] text-[#f4f1eb] hover:from-[#8b2635] hover:to-[#5c1a23] text-lg px-10 py-5 font-medium tracking-wide shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Trailer
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 text-lg px-10 py-5 font-medium tracking-wide"
          >
            <Download className="mr-2 h-5 w-5" />
            Pre-Register
          </Button>
        </div>
        
        <div className="mt-16 text-sm text-[#f4f1eb] font-light tracking-wide">
          <p>Coming Soon 2024 • iOS • Android • Web Browser</p>
        </div>
      </div>
      
      {/* Art Deco corner decorations */}
      <div className="absolute bottom-8 left-8 z-20">
        <div className="w-16 h-16 border-l-2 border-b-2 border-[#d4af37] opacity-60"></div>
      </div>
      <div className="absolute bottom-8 right-8 z-20">
        <div className="w-16 h-16 border-r-2 border-b-2 border-[#d4af37] opacity-60"></div>
      </div>
      <div className="absolute top-24 left-8 z-20">
        <div className="w-16 h-16 border-l-2 border-t-2 border-[#8b2635] opacity-60"></div>
      </div>
      <div className="absolute top-24 right-8 z-20">
        <div className="w-16 h-16 border-r-2 border-t-2 border-[#8b2635] opacity-60"></div>
      </div>
    </section>
  );
}