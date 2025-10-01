import { Separator } from "./ui/separator";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-yellow-400/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm flex items-center justify-center">
                <span className="text-black font-bold">G</span>
              </div>
              <span className="text-yellow-400 font-bold text-xl tracking-wider">GANGSTERS: REAL SITY</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Revolutionary location-based MMO that transforms your real city 
              into a criminal battleground. Build your empire using GPS technology.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 hover:bg-yellow-400 rounded-sm flex items-center justify-center cursor-pointer transition-colors group">
                <Facebook className="h-5 w-5 text-gray-400 group-hover:text-black" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-yellow-400 rounded-sm flex items-center justify-center cursor-pointer transition-colors group">
                <Twitter className="h-5 w-5 text-gray-400 group-hover:text-black" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-yellow-400 rounded-sm flex items-center justify-center cursor-pointer transition-colors group">
                <Youtube className="h-5 w-5 text-gray-400 group-hover:text-black" />
              </div>
              <div className="w-10 h-10 bg-gray-800 hover:bg-yellow-400 rounded-sm flex items-center justify-center cursor-pointer transition-colors group">
                <Instagram className="h-5 w-5 text-gray-400 group-hover:text-black" />
              </div>
            </div>
          </div>
          
          {/* Game Info */}
          <div>
            <h4 className="text-white font-bold mb-4">Game Info</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">System Requirements</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Release Notes</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Community</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Bug Reports</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-yellow-400/30" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2024 Gangsters Game Studio. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <span>Location services required for gameplay</span>
            <span>•</span>
            <span>Age Rating: 17+ (Mature Content)</span>
          </div>
        </div>
        
        {/* Art Deco bottom decoration */}
        <div className="mt-8 flex justify-center">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        </div>
      </div>
    </footer>
  );
}