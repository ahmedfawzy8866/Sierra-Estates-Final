import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../lib/I18nContext';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { COLLECTIONS } from '../../lib/models/schema';
import { COMPOUND_DICT, FURNISHED_DICT, PRICE_MULTIPLIERS, Property, sanitizeFileName, inferPropertyType } from './EasyListingLogic';

export function useEasyListingForm() {
  const { t, locale } = useI18n();
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Extraction Result
  const [extractedData, setExtractedData] = useState<Partial<Property> | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Inventory & UI State
  const [inventory, setInventory] = useState<Property[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [_searchHistory, setSearchHistory] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forge' | 'nexus' | 'spatial'>('forge');
  const [activeTour, setActiveTour] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const _isArabic = locale === 'ar';

  // --- Real-time Inventory ---
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.units), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setInventory(items);
    });

    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('sb_search_history');
      if (history) setSearchHistory(JSON.parse(history));
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --- Image Preview ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setImageFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // --- Logic: Data Extraction & Code Generation ---
  const processListing = (sourceText = description) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const normalizedSource = sourceText.trim();
      const text = normalizedSource.toLowerCase();
      if (!normalizedSource) {
        throw new Error('Missing listing description');
      }
      setDescription(normalizedSource);
      
      // 1. Identify Compound
      let compound = '';
      let compoundCode = '??';
      for (const [key, code] of Object.entries(COMPOUND_DICT)) {
        if (text.includes(key.toLowerCase())) {
          compound = key;
          compoundCode = code;
          break;
        }
      }

      // 2. Identify Bedrooms
      let bedrooms = 0;
      const bedMatch = text.match(/(\d+)\s*(beds|غرف|غرفه|br)/i);
      if (bedMatch) bedrooms = parseInt(bedMatch[1]);

      // 3. Identify Price & Currency
      let price = 0;
      let currency = 'EGP';
      if (text.includes('$') || text.includes('usd')) currency = 'USD';
      
      const priceMatch = text.match(/([\d.,]+)\s*(k|m|ألف|مليون)/i);
      if (priceMatch) {
        const value = parseFloat(priceMatch[1].replace(/,/g, ''));
        const multiplier = PRICE_MULTIPLIERS[priceMatch[2]] || 1;
        price = value * multiplier;
      } else {
        const rawPriceMatch = text.match(/[\d.,]{4,}/);
        if (rawPriceMatch) price = parseFloat(rawPriceMatch[0].replace(/,/g, ''));
      }

      // 4. Identify Furnishing
      let furnished = 'U';
      for (const [key, code] of Object.entries(FURNISHED_DICT)) {
        if (text.includes(key.toLowerCase())) {
          furnished = code;
          break;
        }
      }

      // Format Price for Code
      let priceSuffix = '';
      if (price >= 1000000) priceSuffix = (price / 1000000).toFixed(1).replace('.0', '') + 'M';
      else if (price >= 1000) priceSuffix = (price / 1000).toFixed(0) + 'K';
      else priceSuffix = price.toString();

      const pricePart = (currency === 'USD' ? '$' : '') + priceSuffix;
      const code = `${compoundCode}-${bedrooms}${furnished}-${pricePart}`;
      
      // Social Templates
      const whatsapp = `✦ SIERRA ESTATES REALTY ✦\n\nUnit Code: ${code}\nLocation: ${compound || 'Custom'}\nDetails: ${bedrooms} BR | ${furnished === 'F' ? 'Fully Furnished' : 'Luxury Finish'}\nPrice: ${price.toLocaleString()} ${currency}\n\nContact: ${phone || 'Available Upon Request'}\n#sierraestates #BeyondBrokerage`;
      
      const facebook = `✨ LUXURY PORTFOLIO UPDATE ✨\n\nWe are pleased to present this exclusive listing in ${compound || 'New Cairo'}.\n\n💎 Code: ${code}\n🛏️ Bedrooms: ${bedrooms}\n💰 Price: ${price.toLocaleString()} ${currency}\n\nOur AI-driven platform ensures this is the highest value available today. Experience the Sierra Estates standard.\n\n📞 Call us: ${phone}\n\n#RealEstateEgypt #sierraestates #Investment`;

      setExtractedData({
        compound,
        bedrooms,
        price,
        currency,
        furnished,
        phone,
        whatsappContent: whatsapp,
        facebookContent: facebook,
        code
      });
      setGeneratedCode(code);
      
      // Update Canvas
      setTimeout(() => generateBrandedImage(), 100);

    } catch (_err) {
      setErrorMessage("Failed to analyze text logic.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Logic: Save to Firebase ---
  const saveToFirebase = async () => {
    if (!extractedData || !generatedCode) return;
    
    // Validation
    if (!extractedData.compound) return setErrorMessage(t('easyListing.validation.errorCompound'));
    if (extractedData.bedrooms === undefined) return setErrorMessage(t('easyListing.validation.errorBeds'));
    if (!extractedData.price) return setErrorMessage(t('easyListing.validation.errorPrice'));
    if (!phone) return setErrorMessage(t('easyListing.validation.errorPhone'));

    setIsSaving(true);
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        const imageRef = storageRef(
          storage,
          `listings/${Date.now()}-${sanitizeFileName(imageFile.name)}`
        );
        await uploadBytes(imageRef, imageFile);
        uploadedImageUrl = await getDownloadURL(imageRef);
      }

      const propertyType = inferPropertyType(description || extractedData.type || '');

      await addDoc(collection(db, COLLECTIONS.units), {
        ...extractedData,
        title: `${extractedData.compound || 'Custom'} ${extractedData.bedrooms}BR ${extractedData.type || 'Unit'}`,
        compound: extractedData.compound || 'New Cairo',
        location: extractedData.compound || 'New Cairo',
        city: 'New Cairo',
        area: 150,
        type: extractedData.type || 'Apartment',
        propertyType,
        category: propertyType === 'commercial' ? 'commercial' : 'residential',
        beds: extractedData.bedrooms,
        bedrooms: extractedData.bedrooms,
        baths: 2, // Default
        bathrooms: 2,
        sqm: 150, // Default
        price: extractedData.price,
        phone,
        code: generatedCode,
        referenceNumber: generatedCode,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        featuredImage: uploadedImageUrl || '',
        imageUrl: uploadedImageUrl || '',
        views: Math.floor(Math.random() * 50),
        status: 'available',
        syncSource: 'manual',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Orchestration (Stage 3 Complete)
        orchestrationState: {
          stage: 'S3',
          status: 'completed',
          engineVersion: '4.0.0',
          lastTriggeredAt: serverTimestamp()
        },
        
        // Automation Flags
        automation: {
          isBranded: !!previewUrl,
          isPublishedToPF: false,
          isPublishedToFB: false,
          whatsappAdGenerated: true,
          brandingReady: true,
          publishingReady: false,
          whatsappReady: true
        },
        
        // Unit Identity
        ownerType: 'internal',
        ownerContact: phone,
        description,
        // Added Spatial & Virtual
        coordinates: extractedData.coordinates || { lat: 30.015, lng: 31.490 },
        virtualTourUrl: extractedData.virtualTourUrl || ''
      });
      
      setSuccessMessage(t('common.success'));
      // Reset Form Partially
      setDescription('');
      setPhone('');
      setExtractedData(null);
      setGeneratedCode('');
      setImageFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    } catch (_err) {
      setErrorMessage("Firebase save error.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Canvas Branded Image ---
  const generateBrandedImage = () => {
    if (!canvasRef.current || !previewUrl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.src = previewUrl;
    img.onload = () => {
      canvas.width = 1080;
      canvas.height = 1350; // Instagram Portrait

      // Draw Main Image
      ctx.drawImage(img, 0, 0, 1080, 1080);

      // Dark Footer
      ctx.fillStyle = "#0A1A3A";
      ctx.fillRect(0, 1080, 1080, 270);

      // Gold Accent Line
      ctx.fillStyle = "#C9A24A";
      ctx.fillRect(0, 1075, 1080, 5);

      // Brand Name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 42px serif";
      ctx.textAlign = "center";
      ctx.fillText("✦ SIERRA ESTATES ✦", 540, 1160);

      ctx.fillStyle = "#C9A24A";
      ctx.font = "italic 24px sans-serif";
      ctx.fillText("Beyond Brokerage", 540, 1200);

      // Code & Price
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 64px sans-serif";
      ctx.fillText(generatedCode, 540, 1290);
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const simulateRealWebhook = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage("Operational Intelligence: Webhook Signal Captured.");
    
    // Simulate a slight delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Logic to simulate an automated extraction from a theoretical incoming message
    const mockDescription = "Hyde Park 3BR fully furnished for 5.5M cash. Call 0122334455";
    setDescription(mockDescription);
    processListing(mockDescription);
  };

  const removeInventoryItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.units, itemId));
      setSuccessMessage('Listing removed from inventory.');
    } catch {
      setErrorMessage('Unable to remove listing.');
    }
  };

  const exportToExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Code,Compound,Bedrooms,Price,Currency,Furnished,Phone\n"
      + inventory.map(p => `${p.code},${p.compound},${p.bedrooms},${p.price},${p.currency},${p.furnished},${p.phone}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sierra_blu_inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // --- Filtering ---
  const filteredInventory = inventory.filter(p => 
    (p.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.compound || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.price || '').includes(searchTerm.trim())
  );

  const stats = {
    total: inventory.length,
    totalValue: inventory.reduce((acc, p) => acc + (p.price || 0), 0),
    topCompound: Object.entries(
      inventory.reduce<Record<string, number>>((acc, p) => {
        const key = p.compound || 'Unassigned';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
  };

  return {
    t, locale,
    description, setDescription,
    phone, setPhone,
    imageFile, handleImageChange,
    previewUrl,
    extractedData,
    generatedCode,
    inventory,
    isProcessing,
    isSaving,
    searchTerm, setSearchTerm,
    errorMessage, setErrorMessage,
    successMessage, setSuccessMessage,
    activeTab, setActiveTab,
    activeTour, setActiveTour,
    canvasRef,
    _isArabic,
    processListing,
    saveToFirebase,
    generateBrandedImage,
    copyToClipboard,
    simulateRealWebhook,
    removeInventoryItem,
    exportToExcel,
    filteredInventory,
    stats
  };
}
