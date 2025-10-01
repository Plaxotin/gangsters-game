import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Story() {
  return (
    <section id="story" className="py-24 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] relative">
      {/* Gangster atmosphere effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(139, 38, 53, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(58, 74, 90, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 40% 40%, rgba(212, 175, 55, 0.1) 0%, transparent 30%)`,
          backgroundSize: '400px 400px, 600px 600px, 300px 300px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 bg-[#2e2e2e]/20 border-2 border-[#d4af37]/60 rounded-sm mb-6 art-deco-corner">
            <span className="text-[#d4af37] tracking-wider font-medium">REAL WORLD CONQUEST</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-[#f4f1eb] mb-8 font-serif">
            Your City is the <span className="text-[#8b2635]">Battlefield</span>
          </h2>
          <p className="text-xl md:text-2xl text-[#f4f1eb] max-w-4xl mx-auto leading-relaxed font-light">
            Use your smartphone to capture real restaurants, bars, and businesses. 
            The entire city becomes your criminal empire.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1638447841552-8194177a5536?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBwaG9uZSUyMG1hcCUyMG5hdmlnYXRpb258ZW58MXx8fHwxNzU4OTYwMTE0fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Mobile map navigation"
              className="w-full h-96 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent rounded-lg"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[#d4af37] font-medium">Real maps, real locations, real conquest</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="border-l-4 border-[#d4af37] pl-8 art-deco-corner">
              <h3 className="text-2xl font-bold text-[#f4f1eb] mb-4 font-serif">GPS-Based Gameplay</h3>
              <p className="text-[#7bc4c4] leading-relaxed font-light">
                Walk to real restaurants, bars, and shops in your city to capture them. 
                Use Yandex Maps integration to see which establishments are open 
                and available for conquest.
              </p>
            </div>
            
            <div className="border-l-4 border-[#2d8080] pl-8 art-deco-corner">
              <h3 className="text-2xl font-bold text-[#f4f1eb] mb-4 font-serif">Territory Control</h3>
              <p className="text-[#7bc4c4] leading-relaxed font-light">
                Build your criminal empire by capturing districts and neighborhoods. 
                Control entire areas to earn massive bonuses and establish your dominance 
                over rival players.
              </p>
            </div>
            
            <div className="border-l-4 border-[#4da6a6] pl-8 art-deco-corner">
              <h3 className="text-2xl font-bold text-[#f4f1eb] mb-4 font-serif">Real-Time Strategy</h3>
              <p className="text-[#7bc4c4] leading-relaxed font-light">
                Compete with thousands of players in your city. Form clans, 
                engage in card-based duels, and defend your territory around the clock 
                in this revolutionary mobile MMO.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}