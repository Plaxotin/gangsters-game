import { Button } from "./ui/button";
import { Menu } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-[#4a4a4a]/30 art-deco-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b87333] rounded-sm flex items-center justify-center art-deco-corner">
            <span className="text-[#0a0a0a] font-bold text-lg font-serif">G</span>
          </div>
          <span className="text-[#d4af37] font-bold text-2xl tracking-wider font-serif">GANGSTERS</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-[#f4f1eb] hover:text-[#d4af37] transition-colors font-medium tracking-wide">Home</a>
          <a href="#story" className="text-[#f4f1eb] hover:text-[#d4af37] transition-colors font-medium tracking-wide">Story</a>
          <a href="#features" className="text-[#f4f1eb] hover:text-[#d4af37] transition-colors font-medium tracking-wide">Features</a>
          <a href="#gallery" className="text-[#f4f1eb] hover:text-[#d4af37] transition-colors font-medium tracking-wide">Gallery</a>
          <a href="#download" className="text-[#f4f1eb] hover:text-[#d4af37] transition-colors font-medium tracking-wide">Download</a>
        </nav>
        
        <Button className="hidden md:block bg-gradient-to-r from-[#3a4a5a] to-[#2a3a4a] text-[#f4f1eb] hover:from-[#8b2635] hover:to-[#5c1a23] font-medium tracking-wide">
          Pre-Register
        </Button>
        
        <Button variant="ghost" size="icon" className="md:hidden text-[#f4f1eb]">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}