const CulturalBackground = () => {
  return (
    <div className="cultural-background">
      {/* Mountain Silhouette */}
      <div className="mountain-silhouette animate-float-mountain" />
      
      {/* Floating Cultural Patterns */}
      <div className="floating-patterns">
        {/* Traditional Goji Symbols */}
        <div className="goji-symbol top-20 left-10 animate-goji-pattern" style={{ animationDelay: '0s' }} />
        <div className="goji-symbol top-40 right-16 animate-goji-pattern" style={{ animationDelay: '5s' }} />
        <div className="goji-symbol bottom-40 left-1/4 animate-cultural-pulse" style={{ animationDelay: '2s' }} />
        <div className="goji-symbol top-1/3 right-1/3 animate-goji-pattern" style={{ animationDelay: '8s' }} />
        
        {/* Drifting Clouds */}
        <div className="cultural-clouds top-16 left-0 animate-drift-cloud" style={{ animationDelay: '0s' }} />
        <div className="cultural-clouds top-32 left-0 animate-drift-cloud" style={{ animationDelay: '10s' }} />
        <div className="cultural-clouds top-48 left-0 animate-drift-cloud" style={{ animationDelay: '15s' }} />
        
        {/* Additional Cultural Elements */}
        <div className="absolute top-1/4 left-1/2 w-12 h-12 rounded-full border border-goji-warm/20 animate-cultural-pulse opacity-30" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-8 h-8 rounded-full bg-goji-nature/10 animate-float-mountain opacity-40" style={{ animationDelay: '3s' }} />
        
        {/* Subtle Geometric Patterns */}
        <div className="absolute top-1/2 left-1/6 w-6 h-6 border border-goji-accent/30 rotate-45 animate-goji-pattern opacity-20" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-goji-earth/20 rounded-full animate-cultural-pulse opacity-30" style={{ animationDelay: '6s' }} />
      </div>
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-goji-warm/5 via-transparent to-goji-nature/5 pointer-events-none" />
    </div>
  );
};

export default CulturalBackground;