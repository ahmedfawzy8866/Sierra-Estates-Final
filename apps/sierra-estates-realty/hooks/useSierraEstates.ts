"use client";

import { useState, useEffect } from 'react';
import { db, isFirebaseClientConfigured } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';

/**
 * useSierraEstates
 * The master hook for the Sierra Estates Frontend.
 * abstracts away the direct Firebase calls for Claude Code.
 */
/**
 * Curated showcase estates - rendered only when Firebase credentials are
 * absent (local preview / demo). Production with real credentials streams
 * live inventory from Firestore instead.
 */
const SAMPLE_UNITS = [
  { id: 'demo-01', title: 'Grand Lakefront Villa', compound: 'Mivida', price: 28500000, rooms: 5, propertyType: 'Villa', status: 'available', imageUrl: '/media__1776832052152.jpg', intelligence: { roi: 11.2 } },
  { id: 'demo-02', title: 'Golf-View Palace Estate', compound: 'Katameya Heights', price: 42000000, rooms: 6, propertyType: 'Villa', status: 'available', imageUrl: '/media__1776833126303.jpg', intelligence: { roi: 9.8 } },
  { id: 'demo-03', title: 'Sky Penthouse Collection', compound: 'Eastown', price: 14750000, rooms: 4, propertyType: 'Penthouse', status: 'available', imageUrl: '/media__1776833126328.jpg', intelligence: { roi: 10.5 } },
  { id: 'demo-04', title: 'Garden Duplex Residence', compound: 'Hyde Park', price: 9900000, rooms: 3, propertyType: 'Duplex', status: 'available', imageUrl: '/media__1776831998824.jpg', intelligence: { roi: 9.1 } },
  { id: 'demo-05', title: 'Emerald Twin House', compound: 'Uptown Cairo', price: 18200000, rooms: 4, propertyType: 'Twin House', status: 'available', imageUrl: '/estate.png', intelligence: { roi: 8.7 } },
  { id: 'demo-06', title: 'Designer Park Apartment', compound: 'Zed East', price: 6400000, rooms: 2, propertyType: 'Apartment', status: 'available', imageUrl: '/media__1776833126231.png', intelligence: { roi: 8.2 } },
];

export function useSierraEstates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Units (Inventory) ---
  const [units, setUnits] = useState<any[]>(isFirebaseClientConfigured ? [] : SAMPLE_UNITS);
  
  useEffect(() => {
    if (!isFirebaseClientConfigured) {
      // Local preview without Firebase credentials - render with empty data.
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "units"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const unitData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUnits(unitData);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // --- Leads & Proposals ---
  const getLeadData = async (leadId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "stakeholders", leadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- Agent Commands ---
  const triggerAgent = async (agentName: string, action: string, payload: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    units,
    loading,
    error,
    getLeadData,
    triggerAgent
  };
}
