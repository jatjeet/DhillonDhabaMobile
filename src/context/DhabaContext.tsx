import React, { createContext, useContext, useState, useEffect } from 'react';
import { OutletResponseDto, OutletStatusDto, AddressResponseDto } from '../types';
import { outletApi } from '../api/outletApi';
import { meApi } from '../api/meApi';
import { mockOutlet, mockOutletStatus } from '../api/mockData';

interface DhabaContextType {
  outlet: OutletResponseDto | null;
  outletStatus: OutletStatusDto | null;
  addresses: AddressResponseDto[];
  selectedAddress: AddressResponseDto | null;
  isLoading: boolean;
  setSelectedAddress: (addr: AddressResponseDto) => void;
  refreshDhabaData: () => Promise<void>;
  reloadAddresses: () => Promise<void>;
}

const DhabaContext = createContext<DhabaContextType>({} as DhabaContextType);

export const DhabaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [outlet, setOutlet] = useState<OutletResponseDto | null>(mockOutlet);
  const [outletStatus, setOutletStatus] = useState<OutletStatusDto | null>(mockOutletStatus);
  const [addresses, setAddresses] = useState<AddressResponseDto[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    refreshDhabaData();
  }, []);

  const refreshDhabaData = async () => {
    try {
      setIsLoading(true);
      const outlets = await outletApi.getAll();
      if (outlets.length > 0) {
        setOutlet(outlets[0]);
        const status = await outletApi.getStatus(outlets[0].id);
        setOutletStatus(status);
      }
      await reloadAddresses();
    } catch (err) {
      console.warn('Failed to load dhaba data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadAddresses = async () => {
    try {
      const addrs = await meApi.getAddresses();
      setAddresses(addrs);
      if (addrs.length > 0) {
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
        setSelectedAddress(prev => prev || defaultAddr);
      }
    } catch (err) {
      console.warn('Failed to load addresses:', err);
    }
  };

  return (
    <DhabaContext.Provider
      value={{
        outlet,
        outletStatus,
        addresses,
        selectedAddress,
        isLoading,
        setSelectedAddress,
        refreshDhabaData,
        reloadAddresses,
      }}
    >
      {children}
    </DhabaContext.Provider>
  );
};

export const useDhaba = () => useContext(DhabaContext);

