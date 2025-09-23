import React from 'react';

const Header = () => {
  return (
    <header className="relative h-[400px] md:h-[500px] overflow-hidden rounded-b-xl shadow-glow animate-fade-in-up">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out"
        style={{
          backgroundImage: `url(https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)`,
          backgroundAttachment: 'fixed', // Parallax effect
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-text drop-shadow-lg mb-4 leading-tight">
          AI-Powered <span className="text-primary">Question</span> Auditor
        </h1>
        <p className="text-lg md:text-xl text-textSecondary max-w-3xl animate-fade-in-up delay-200">
          Leveraging <strong className="text-secondary">Gemini AI</strong> to meticulously validate and categorize educational content. Ensuring accuracy, one question at a time.
        </p>
      </div>
    </header>
  );
};

export default Header;
