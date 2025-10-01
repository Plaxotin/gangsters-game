import { Card, CardContent } from "./ui/card";
import { MapPin, Users, Smartphone, Sword, Building2, Trophy } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Features() {
  const features = [
    {
      icon: MapPin,
      title: "GPS Conquest",
      description: "Walk to real establishments in your city to capture them. Restaurants, bars, shops - all become part of your empire."
    },
    {
      icon: Users,
      title: "Clan Warfare",
      description: "Form clans with up to 20+ members. Share income, coordinate attacks, and vote on strategic decisions together."
    },
    {
      icon: Smartphone,
      title: "Real-Time Map",
      description: "See live opening hours of establishments. Plan your conquests when businesses are open and vulnerable."
    },
    {
      icon: Sword,
      title: "Card-Based Duels",
      description: "Challenge rival players with strategic card battles. Use weapons, armor, and special moves to win territory."
    },
    {
      icon: Building2,
      title: "District Bonuses",
      description: "Control entire neighborhoods for +30% income. Dominate multiple districts for even greater rewards."
    },
    {
      icon: Trophy,
      title: "Global Rankings",
      description: "Compete on city, regional, and world leaderboards. Earn titles from 'Newcomer' to 'Crime Boss'."
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] relative">
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1662377088181-e32267d57ed7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9va2x5biUyMG5pZ2h0JTIwc3RyZWV0JTIwbGlnaHRzfGVufDF8fHx8MTc1ODk3MzQzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Brooklyn night street"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 to-[#1a1a1a]/60"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 bg-[#2e2e2e]/20 border-2 border-[#d4af37]/60 rounded-sm mb-6 art-deco-corner">
            <span className="text-[#d4af37] tracking-wider font-medium">INNOVATIVE FEATURES</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-[#f4f1eb] mb-8 font-serif">
            Next-Gen <span className="text-[#8b2635]">MMO Gaming</span>
          </h2>
          <p className="text-xl md:text-2xl text-[#f4f1eb] max-w-4xl mx-auto leading-relaxed font-light">
            Revolutionary location-based gameplay that turns your entire city 
            into a massive multiplayer battleground.
          </p>
        </div>
        
        {/* Featured Image */}
        <div className="mb-16 relative">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1626197113408-9d8db8f7b8d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwcmVhbCUyMGVzdGF0ZSUyMGJ1aWxkaW5nc3xlbnwxfHx8fDE3NTg5NjQ3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="City buildings and real estate"
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/80 via-transparent to-[#1a1a1a]/80 rounded-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-[#f4f1eb] mb-3 font-serif">Real World Integration</h3>
              <p className="text-[#f4f1eb] font-light">Every building in your city can become part of your criminal empire</p>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-[#1a1a1a]/60 border-[#4a4a4a]/40 hover:border-[#d4af37]/60 transition-all duration-300 hover:shadow-lg backdrop-blur-sm art-deco-corner">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#b87333] rounded-sm flex items-center justify-center mr-5 art-deco-corner">
                    <feature.icon className="h-7 w-7 text-[#0a0a0a]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#f4f1eb] font-serif">{feature.title}</h3>
                </div>
                <p className="text-[#f4f1eb] leading-relaxed font-light">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Art Deco decoration */}
        <div className="mt-16 flex justify-center">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1753234506830-069cff1f25ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBkZWNvJTIwcGF0dGVybiUyMGdvbGR8ZW58MXx8fHwxNzU4OTY0MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Art Deco pattern"
            className="w-32 h-16 object-cover opacity-60"
          />
        </div>
      </div>
    </section>
  );
}