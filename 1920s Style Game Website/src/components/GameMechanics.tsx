import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, DollarSign, Shield, Users2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function GameMechanics() {
  const establishmentTypes = [
    {
      type: "Small",
      examples: "Cafes, Kiosks, Small Shops",
      income: "$10/hour",
      requirement: "Solo Player",
      color: "bg-green-500"
    },
    {
      type: "Medium", 
      examples: "Restaurants, Stores, Bars",
      income: "$30/hour",
      requirement: "Clan (up to 20 members)",
      color: "bg-yellow-500"
    },
    {
      type: "Large",
      examples: "Shopping Malls, Clubs, Hotels",
      income: "$100/hour",
      requirement: "Large Clan (20+ members)",
      color: "bg-red-500"
    }
  ];

  const bonuses = [
    {
      icon: DollarSign,
      title: "District Control",
      bonus: "+30%",
      description: "Control all establishments in a neighborhood"
    },
    {
      icon: Shield,
      title: "Regional Dominance",
      bonus: "+20%",
      description: "Control multiple adjacent districts"
    },
    {
      icon: Clock,
      title: "Long-term Ownership",
      bonus: "Up to +50%",
      description: "+10% for each week of continuous control"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] relative">
      <div className="absolute inset-0 opacity-25">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1602619075660-d0f5459cb189?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9va2x5biUyMG5pZ2h0JTIwc3RyZWV0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU4OTczNDQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Brooklyn night street photography"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/70 to-[#0a0a0a]/80"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-3 bg-[#2e2e2e]/20 border-2 border-[#d4af37]/60 rounded-sm mb-6 art-deco-corner">
            <span className="text-[#d4af37] tracking-wider font-medium">GAME MECHANICS</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-[#f4f1eb] mb-8 font-serif">
            How to <span className="text-[#8b2635]">Dominate</span>
          </h2>
          <p className="text-xl md:text-2xl text-[#f4f1eb] max-w-4xl mx-auto leading-relaxed font-light">
            Master the complex systems of territory control, clan management, and strategic warfare.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Establishment Types */}
          <div>
            <h3 className="text-3xl font-bold text-[#f4f1eb] mb-10 font-serif">Establishment Types</h3>
            <div className="space-y-6">
              {establishmentTypes.map((est, index) => (
                <Card key={index} className="bg-[#1a1a1a]/70 border-[#4a4a4a]/40 hover:border-[#d4af37]/60 transition-all duration-300 backdrop-blur-sm art-deco-corner">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 ${est.color} rounded-full mr-4`}></div>
                        <h4 className="text-xl font-bold text-[#f4f1eb] font-serif">{est.type} Establishments</h4>
                      </div>
                      <Badge className="bg-[#d4af37] text-[#0a0a0a] font-medium">{est.income}</Badge>
                    </div>
                    <p className="text-[#f4f1eb] mb-3 font-light">{est.examples}</p>
                    <p className="text-[#f4f1eb] text-sm font-medium">Requirement: {est.requirement}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Card Duels */}
          <div>
            <h3 className="text-3xl font-bold text-[#f4f1eb] mb-10 font-serif">Card-Based Duels</h3>
            <div className="relative art-deco-corner">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1568579572569-e4ce0df95215?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF5aW5nJTIwY2FyZHMlMjBkZWNrJTIwZ2FtZXxlbnwxfHx8fDE3NTg5NjQ3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Playing cards for duels"
                className="w-full h-72 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/90 to-transparent rounded-lg"></div>
              <div className="absolute bottom-6 left-6 right-6 text-[#f4f1eb]">
                <h4 className="text-xl font-bold mb-3 font-serif">Strategic Combat</h4>
                <p className="text-[#f4f1eb] text-sm font-light">Use weapon, armor, and special move cards to defeat rivals and claim their territory.</p>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center text-[#f4f1eb]">
                <div className="w-3 h-3 bg-[#d4af37] rounded-full mr-4"></div>
                <span className="font-light">30-minute duel timer when challenged</span>
              </div>
              <div className="flex items-center text-[#f4f1eb]">
                <div className="w-3 h-3 bg-[#3a4a5a] rounded-full mr-4"></div>
                <span className="font-light">Winner takes control of establishment</span>
              </div>
              <div className="flex items-center text-[#f4f1eb]">
                <div className="w-3 h-3 bg-[#8b2635] rounded-full mr-4"></div>
                <span className="font-light">Loser pays 20% penalty + 24h hospital time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Bonuses */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-[#f4f1eb] text-center mb-12 font-serif">Income Multipliers</h3>
          <div className="grid md:grid-cols-3 gap-10">
            {bonuses.map((bonus, index) => (
              <Card key={index} className="bg-[#1a1a1a]/70 border-[#4a4a4a]/40 hover:border-[#d4af37]/60 transition-all duration-300 text-center backdrop-blur-sm art-deco-corner">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#b87333] rounded-full flex items-center justify-center mx-auto mb-6 art-deco-corner">
                    <bonus.icon className="h-10 w-10 text-[#0a0a0a]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#f4f1eb] mb-3 font-serif">{bonus.title}</h4>
                  <div className="text-3xl font-bold text-[#8b2635] mb-3 font-serif">{bonus.bonus}</div>
                  <p className="text-[#f4f1eb] text-sm font-light">{bonus.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Clan System */}
        <div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-[#f4f1eb] mb-6 font-serif">Clan System</h3>
              <div className="space-y-4">
                <Card className="bg-[#1a1a1a]/70 border-[#d4af37]/30 art-deco-corner">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-[#f4f1eb] mb-2 font-serif">Join Requirements</h4>
                    <p className="text-[#f4f1eb] text-sm font-light">Own at least 2 establishments to be eligible</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#1a1a1a]/70 border-[#d4af37]/30 art-deco-corner">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-[#f4f1eb] mb-2 font-serif">Shared Income</h4>
                    <p className="text-[#f4f1eb] text-sm font-light">All clan income distributed by ownership shares</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#1a1a1a]/70 border-[#d4af37]/30 art-deco-corner">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-[#f4f1eb] mb-2 font-serif">Democratic Voting</h4>
                    <p className="text-[#f4f1eb] text-sm font-light">Members vote on share redistribution</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758691737535-57edd2a11d73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwZ3JvdXAlMjBwZW9wbGUlMjBidXNpbmVzc3xlbnwxfHx8fDE3NTg5NjQ3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Team collaboration"
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent rounded-lg"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[#d4af37] text-sm font-medium">Build powerful alliances to control the city</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}