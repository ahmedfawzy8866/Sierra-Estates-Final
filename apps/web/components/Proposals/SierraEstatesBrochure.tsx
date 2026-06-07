"use client";

import React, { useRef, useState, useEffect } from "react";
import { InventoryService, Property } from "@/lib/services/InventoryService";

export default function SierraEstatesBrochure({ propertyId }: { propertyId?: string }) {
  const brochureRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // =========================
  // COMPANY DATA
  // =========================
  const company = {
    name: "Sierra Estates",
    agent: "Ahmed Fawzy",
    phone: "+2 01092048333",
    website: "www.sierraestates.com",
    logo: "/logo.png",
  };

  // =========================
  // PROPERTY DATA (State)
  // =========================
  const [propertyData, setPropertyData] = useState<Property | any>({
    title: "Jabel Ali Village",
    propertyType: "Luxury Townhouse",
    price: "AED 5.3M",
    bedrooms: 3,
    bathrooms: 4,
    area: 2746,
    description:
      "Luxury townhouse with premium amenities, elegant interiors, landscaped surroundings, and modern architecture in one of Dubai’s most attractive residential communities.",
    amenities: [
      "Swimming Pool",
      "Kids Play Area",
      "Green Trails",
      "Clubhouse",
      "Prime Location",
      "24/7 Security",
    ],
  });

  const [isLoading, setIsLoading] = useState(!!propertyId);

  useEffect(() => {
    if (propertyId) {
      InventoryService.getProperty(propertyId).then((data) => {
        if (data) {
          setPropertyData({
            ...data,
            // Format price cleanly
            price: `EGP ${(data.price || 0).toLocaleString()}`,
            // Add static amenities if none provided in DB
            amenities: [
              "Swimming Pool", "Kids Play Area", "24/7 Security", "Premium Finishing"
            ],
          });
        }
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to load property:", err);
        setIsLoading(false);
      });
    }
  }, [propertyId]);

  const handleDownloadPDF = async () => {
    if (!brochureRef.current) return;
    setIsGenerating(true);
    
    try {
      const element = brochureRef.current;
      const opt = {
        margin: 0,
        filename: `${propertyData.title.replace(/\s+/g, '_')}_Brochure.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      // Dynamically import html2pdf.js only on the client side when the button is clicked
      const html2pdfModule = (await import("html2pdf.js")).default;
      await html2pdfModule().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 min-h-screen">
      {/* Control Panel */}
      <div className="mb-8 w-full max-w-[210mm] flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Proposal Generator</h2>
        <button
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Brochure A4 Canvas */}
      <div 
        className="bg-white shadow-xl overflow-hidden relative"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div ref={brochureRef} className="w-full h-full bg-white relative pb-16">
          {/* Header Section */}
          <div className="h-64 bg-slate-900 relative flex flex-col justify-between p-12 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-light tracking-widest uppercase mb-2">{company.name}</h1>
                <div className="h-0.5 w-16 bg-amber-500"></div>
              </div>
            </div>

            <div className="relative z-10">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold tracking-widest uppercase rounded-full inline-block mb-3">
                {propertyData.propertyType || propertyData.type}
              </span>
              <h2 className="text-5xl font-bold tracking-tight">{propertyData.title}</h2>
              <p className="text-2xl mt-2 text-slate-300 font-light">{propertyData.price}</p>
            </div>
          </div>

          {/* Main Content Body */}
          <div className="p-12 grid grid-cols-12 gap-12">
            
            {/* Left Column: Details & Description */}
            <div className="col-span-8 space-y-10">
              <div>
                <h3 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4 border-b pb-2">Property Overview</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {propertyData.description || "An exceptional property located in one of the most highly sought-after destinations, offering a premium lifestyle and sophisticated living spaces designed to the highest standards."}
                </p>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl mb-2">🛏️</span>
                  <span className="text-xl font-bold text-gray-900">{propertyData.bedrooms}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Bedrooms</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl mb-2">🛁</span>
                  <span className="text-xl font-bold text-gray-900">{propertyData.bathrooms || "N/A"}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Bathrooms</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl mb-2">📐</span>
                  <span className="text-xl font-bold text-gray-900">{propertyData.area || propertyData.bua}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Built Up Area</span>
                </div>
              </div>
            </div>

            {/* Right Column: Amenities & Contact */}
            <div className="col-span-4 space-y-10">
              {/* Amenities */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-semibold tracking-widest text-slate-900 uppercase mb-4">Premium Amenities</h3>
                <ul className="space-y-3">
                  {propertyData.amenities?.map((amenity: string, index: number) => (
                    <li key={index} className="flex items-center text-slate-600">
                      <svg className="w-4 h-4 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer / Contact Section (Absolute to bottom of A4) */}
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="border-t border-gray-200 pt-8 flex justify-between items-end">
              <div>
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Presented By</p>
                <h4 className="text-xl font-semibold text-gray-900">{company.agent}</h4>
                <p className="text-gray-500">{company.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-medium mb-1">{company.phone}</p>
                <p className="text-amber-600 font-medium">{company.website}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
