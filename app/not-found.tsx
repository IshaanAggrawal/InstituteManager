"use client";

import React from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#111] overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* --- CSS for the Swinging Animation --- */}
      <style jsx>{`
        @keyframes swing {
          0% { transform: rotate(15deg); }
          50% { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
          52% { opacity: 0.1; }
          54% { opacity: 1; }
          80% { opacity: 1; }
          82% { opacity: 0.7; }
          84% { opacity: 1; }
        }
        .pendulum-container {
          position: absolute;
          top: 0;
          left: 50%;
          transform-origin: top;
          animation: swing 3s infinite ease-in-out;
        }
        .bulb-glow {
          box-shadow: 0 0 50px 20px rgba(255, 220, 100, 0.2),
                      0 0 100px 50px rgba(255, 220, 100, 0.1);
          animation: flicker 4s infinite random;
        }
      `}</style>

      {/* --- The Swinging Light Bulb Structure --- */}
      <div className="pendulum-container w-2 h-75 sm:h-100">
        {/* The Cord */}
        <div className="w-0.5 h-full bg-gray-600 mx-auto relative"></div>
        
        {/* The Bulb Holder */}
        <div className="w-6 h-8 bg-gray-800 mx-auto -mt-1 rounded-t-sm border-t border-gray-600"></div>
        
        {/* The Bulb Glass */}
        <div className="w-16 h-16 bg-[#ffeba7] rounded-full mx-auto -mt-2 relative z-10 bulb-glow flex items-center justify-center">
             {/* Filament */}
             <div className="w-8 h-8 border-t-2 border-yellow-600 rounded-full opacity-50"></div>
        </div>
      </div>

      {/* --- The 404 Content --- */}
      <div className="z-0 text-center px-4 mt-20">
        {/* Giant background text that gets lit up */}
        <h1 className="text-[150px] md:text-[200px] font-black leading-none text-gray-800 tracking-tighter opacity-30 select-none">
          404
        </h1>

        <div className="relative -mt-10 md:-mt-16 bg-[#111]/80 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              It's dark in here...
            </h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
              The page you are looking for seems to have burnt out or never existed.
            </p>

            <Link 
              href="/"
              className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white transition-all duration-200 bg-yellow-600 rounded-full hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600"
            >
              Turn on the Lights (Go Home)
              {/* Arrow Icon */}
              <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
        </div>
      </div>

    </div>
  );
};

export default NotFound;