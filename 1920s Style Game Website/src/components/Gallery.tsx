import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Play, Image as ImageIcon } from "lucide-react";

export function Gallery() {
  const screenshots = [
    {
      title: "Live Map View",
      description: "See real establishments you can capture nearby",
      type: "screenshot"
    },
    {
      title: "Card Duel System",
      description: "Strategic battles using weapon and armor cards",
      type: "screenshot"
    },
    {
      title: "Territory Control",
      description: "Visualize your empire across the real city",
      type: "screenshot"
    },
    {
      title: "Clan Management",
      description: "Coordinate with up to 20+ clan members",
      type: "screenshot"
    },
    {
      title: "Income Dashboard",
      description: "Track earnings from your establishments",
      type: "screenshot"
    },
    {
      title: "Gameplay Trailer",
      description: "See location-based MMO gameplay in action",
      type: "video"
    }
  ];

  return (
    <section id="gallery" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-yellow-400/20 border border-yellow-400/50 rounded-sm mb-4">
            <span className="text-yellow-400 tracking-wider">SCREENSHOTS & VIDEOS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            See the <span className="text-yellow-400">Action</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the revolutionary mobile interface and location-based mechanics 
            that bring criminal empire building to the real world.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {screenshots.map((item, index) => (
            <Card key={index} className="bg-gray-900 border-yellow-400/30 hover:border-yellow-400/60 transition-colors group cursor-pointer">
              <CardContent className="p-0 relative overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  {item.type === "video" ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-black ml-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center group-hover:from-yellow-400/30 group-hover:to-yellow-600/30 transition-colors">
                      <ImageIcon className="h-12 w-12 text-yellow-400" />
                    </div>
                  )}
                  
                  {/* Simulated screenshot placeholder */}
                  <div className="absolute inset-4 border border-yellow-400/30 rounded"></div>
                  <div className="absolute top-6 left-6 right-6 h-2 bg-yellow-400/20 rounded"></div>
                  <div className="absolute top-10 left-6 right-16 h-1 bg-yellow-400/10 rounded"></div>
                  <div className="absolute bottom-6 left-6 right-6 h-8 bg-yellow-400/20 rounded"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            View Full Gallery
          </Button>
        </div>
      </div>
    </section>
  );
}