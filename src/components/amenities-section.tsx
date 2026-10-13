import React from 'react';
import { Waves, Flower2, BookOpen, Car, Shield, Sparkles } from 'lucide-react';

export function AmenitiesSection() {
  const amenities = [
    {
      icon: Waves,
      title: 'Basalt Stone Lap Pool',
      description:
        'A 25-meter heated freshwater pool carved directly into black basalt rock, flanked by shaded sunbeds and fragrant jasmine.',
    },
    {
      icon: Flower2,
      title: 'Heritage Ayurvedic Spa',
      description:
        'Holistic therapeutic treatments, restorative steam pavilions, and herbal compresses crafted from estate-grown botanicals.',
    },
    {
      icon: BookOpen,
      title: 'Artisan Library & Vinyl Bar',
      description:
        'A quiet salon housing regional historical manuscripts, art monographs, and a curated analog record listening station.',
    },
    {
      icon: Car,
      title: 'Estate Chauffeur & Transfers',
      description:
        'Seamless luxury airport transfers from Kolhapur (KLH) or Pune, along with curated private temple and Panhala Fort excursions.',
    },
    {
      icon: Shield,
      title: '24/7 Dedicated Butler Desk',
      description:
        'Personalized round-the-clock attention for in-suite requests, private dining arrangements, and bespoke itinerary planning.',
    },
    {
      icon: Sparkles,
      title: 'Evening Sunset Ragas',
      description:
        'Live acoustic sitar and flute performances in the central reflection courtyard as dusk settles over the estate.',
    },
  ];

  return (
    <section id="amenities" className="py-28 md:py-36 px-6 md:px-12 bg-hotel-sand/40 border-b border-hotel-charcoal/10">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hotel-charcoal/5 text-[10px] uppercase tracking-[0.2em] text-hotel-cypress font-medium mb-4">
            <Sparkles className="w-3 h-3 text-hotel-brass" />
            <span>Curated Privileges</span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl text-hotel-charcoal font-normal tracking-tight">
            Estate Amenities
          </h2>
          <p className="mt-4 text-hotel-muted text-base sm:text-lg leading-relaxed">
            Every facility is calibrated to protect your tranquility and deepen your immersion into Deccan culture.
          </p>
        </div>

        {/* 6-Cell Grid with Double-Bezel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="doppelrand-shell group">
                <div className="doppelrand-core p-8 h-full flex flex-col justify-between bg-white transition-all duration-300 group-hover:shadow-card">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-hotel-sand flex items-center justify-center text-hotel-cypress group-hover:bg-hotel-cypress group-hover:text-white transition-colors duration-300 mb-6">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-hotel-charcoal mb-3">
                      {item.title}
                    </h3>
                    <p className="text-xs text-hotel-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
