import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Property {
  id: string;
  title: string;
  title_ar: string;
  compound: string;
  location: string;
  location_ar: string;
  purpose: string;
  category: string;
  price: number;
  currency: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  ai_score: number;
  ai_label: string;
  delivery_year: number;
  tags: string[];
  images: string[];
  source: string;
}

export function useProperties(mode: string, selCmps: string[], rooms: number | null, sort: string) {
  const [data, setData] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchProperties = async () => {
      try {
        const listingsRef = collection(db, "listings");
        let q = query(listingsRef);

        // Fetch all initially, then filter client-side since Firestore
        // has limitations with multiple dynamic IN queries and compound indexing.
        const querySnapshot = await getDocs(q);
        let results: Property[] = [];
        
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as Property);
        });

        // 1. Filter by mode (purpose)
        if (mode === "rent") {
          results = results.filter(p => p.purpose === "for-rent");
        } else if (mode === "resale") {
          results = results.filter(p => p.purpose === "for-sale");
        }

        // 2. Filter by rooms
        if (rooms) {
          results = results.filter(p => p.bedrooms === rooms);
        }

        // 3. Filter by compounds
        if (selCmps.length > 0) {
          results = results.filter(p => 
            selCmps.some(c => p.compound?.toLowerCase().includes(c.toLowerCase()))
          );
        }

        // 4. Sort
        if (sort === "ai")        results.sort((a, b) => b.ai_score - a.ai_score);
        else if (sort === "priceLow")  results.sort((a, b) => a.price - b.price);
        else if (sort === "priceHigh") results.sort((a, b) => b.price - a.price);
        else if (sort === "area")      results.sort((a, b) => b.area - a.area);

        setData(results);
        setTotal(results.length);
      } catch (error) {
        console.error("Error fetching properties from Firebase:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [mode, selCmps, rooms, sort]);

  return { data, total, loading };
}
