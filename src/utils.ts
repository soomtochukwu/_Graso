// Utility functions for Graso - Mantle Sepolia Edition
// Wraps contract integration for use by components

import * as contractIntegration from "./smart-contract/contractIntegration";

export type { PropertyInfo, Contributor } from "./smart-contract/contractIntegration";

/**
 * Create a new property listing
 */
export const createProperty = async (
  title: string,
  description: string,
  propertyType: string,
  image: string,
  price: number,
  deadline: number,
  longitude: string,
  latitude: string,
) => {
  return contractIntegration.createProperty(
    title,
    description,
    image,
    propertyType,
    price,
    deadline,
    longitude,
    latitude
  );
};

/**
 * Get all properties
 */
export const getAllProperties = async () => {
  return contractIntegration.getAllProperties();
};

/**
 * Get property info by ID
 */
export const getProjectInfo = async (propertyId: string | number) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  return contractIntegration.getPropertyInfo(id);
};

/**
 * Contribute to a property campaign
 */
export const contributeToCampaign = async (
  propertyId: string | number,
  amount: number
) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  return contractIntegration.contribute(id, amount);
};

/**
 * Get contributors for a property
 */
export const getCampaignContributors = async (propertyId: string | number) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  return contractIntegration.getContributors(id);
};

/**
 * Check if address is a contributor
 */
export const isContributor = async (
  propertyId: string | number,
  address: string
): Promise<boolean> => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  return contractIntegration.isContributor(id, address);
};

/**
 * Withdraw funds from property (creator only)
 */
export const withdrawFunds = async (propertyId: string | number) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  return contractIntegration.withdraw(id);
};

/**
 * Finalize a crowdfund campaign
 */
export const finalizeCrowdfund = async (propertyId: string | number) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  return contractIntegration.finalizeCampaign(id);
};

/**
 * Get property details with contributors
 */
export const getPropertyDetailsWithContributors = async (
  propertyId: string | number
) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  const info = await contractIntegration.getPropertyInfo(id);
  const contributors = await contractIntegration.getContributors(id);

  if (info && contributors) {
    return {
      ...info,
      contributors,
    };
  }

  return null;
};

/**
 * Check campaign status
 */
export const checkCampaignStatus = async (propertyId: string | number) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  const info = await contractIntegration.getPropertyInfo(id);
  
  if (info && info.deadline * 1000 < Date.now() && info.isActive) {
    await contractIntegration.finalizeCampaign(id);
    return contractIntegration.getPropertyInfo(id);
  }
  
  return info;
};

/**
 * Get campaign progress
 */
export const getCampaignProgress = async (propertyId: string | number) => {
  const id = typeof propertyId === 'string' ? parseInt(propertyId) : propertyId;
  const info = await contractIntegration.getPropertyInfo(id);

  if (info) {
    const progress = (info.currentAmount / info.price) * 100;
    return {
      currentAmount: info.currentAmount,
      price: info.price,
      progress: Math.min(progress, 100),
      isComplete: progress >= 100,
    };
  }

  return null;
};
