import React from 'react';

const LocationMap: React.FC = () => {
  const address = "450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France";
  const embedUrl = "https://www.openstreetmap.org/export/embed.html?bbox=1.19129,49.46281,1.19893,49.46615&layer=mapnik&marker=49.46448,1.19511";

  return (
    <div className="h-80 bg-gray-200 rounded-lg overflow-hidden shadow-md">
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={embedUrl}
        title={`Carte de localisation pour ${address}`}
        style={{ border: 0 }}
      ></iframe>
    </div>
  );
};

export default LocationMap;
