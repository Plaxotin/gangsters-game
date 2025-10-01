import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, Download as DownloadIcon, Star, Users } from "lucide-react";

export function Download() {
  const platforms = [
    { name: "iPhone (iOS)", status: "Coming Soon", icon: "📱" },
    { name: "Android", status: "Coming Soon", icon: "📱" },
    { name: "Web Browser", status: "Coming Soon", icon: "🌐" },
    { name: "PWA (Progressive Web App)", status: "Coming Soon", icon: "💻" }
  ];

  const editions = [
    {
      name: "Free to Play",
      price: "Free",
      features: [
        "Full Game Access",
        "Capture Small Establishments",
        "Basic Card Deck",
        "In-App Purchases Available"
      ],
      popular: false
    },
    {
      name: "Starter Pack",
      price: "$9.99",
      features: [
        "Premium Card Pack",
        "500 In-Game Currency",
        "Exclusive Avatar",
        "7-Day Experience Boost",
        "No Ads for 30 Days"
      ],
      popular: true
    },
    {
      name: "Crime Boss Pack",
      price: "$29.99",
      features: [
        "Everything in Starter Pack",
        "Elite Card Collection",
        "2000 In-Game Currency",
        "Permanent Experience Boost",
        "Premium Support"
      ],
      popular: false
    }
  ];

  return (
    <section id="download" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-yellow-400/20 border border-yellow-400/50 rounded-sm mb-4">
            <span className="text-yellow-400 tracking-wider">GET EARLY ACCESS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Enter the <span className="text-yellow-400">Underground</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Be among the first to experience revolutionary location-based MMO gaming. 
            Download on mobile and web platforms.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <span>Release: Q4 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Based on beloved classics</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              <span>50,000+ wishlisted</span>
            </div>
          </div>
        </div>
        
        {/* Editions */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {editions.map((edition, index) => (
            <Card key={index} className={`relative ${edition.popular ? 'border-yellow-400 scale-105' : 'border-yellow-400/30'} bg-black/50`}>
              {edition.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{edition.name}</h3>
                  <div className="text-3xl font-bold text-yellow-400">{edition.price}</div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {edition.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${edition.popular 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400' 
                    : 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                  }`}
                  variant={edition.popular ? 'default' : 'outline'}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Pre-Order Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Platforms */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Available Platforms</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform, index) => (
              <Card key={index} className="bg-gray-900 border-yellow-400/30">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{platform.icon}</div>
                  <h4 className="font-bold text-white mb-1">{platform.name}</h4>
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    {platform.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">
            Add to your wishlist to be notified when the game launches
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
              Pre-Register on App Store
            </Button>
            <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
              Pre-Register on Google Play
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}