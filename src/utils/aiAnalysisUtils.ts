
import { LeadData } from "@/types/leads";

// AI analysis utility functions
export const analyzeLeadQuality = (leads: LeadData[]): number => {
  // Simple AI simulation that calculates lead quality score (0-100)
  if (!leads.length) return 0;
  
  const scoreMap = { cold: 30, warm: 60, hot: 90 };
  const statusMap = { new: 20, contacted: 40, qualified: 70, proposal: 90, closed: 100 };
  
  const totalScore = leads.reduce((acc, lead) => {
    const temperatureScore = scoreMap[lead.score] || 50;
    const statusScore = statusMap[lead.status] || 30;
    return acc + (temperatureScore * 0.6 + statusScore * 0.4);
  }, 0);
  
  return Math.round(totalScore / leads.length);
};

export const getPredictedConversions = (leads: LeadData[]): number => {
  // Predict how many leads might convert
  if (!leads.length) return 0;
  
  const conversionRates = {
    cold: { new: 0.05, contacted: 0.1, qualified: 0.2, proposal: 0.3 },
    warm: { new: 0.1, contacted: 0.25, qualified: 0.4, proposal: 0.6 },
    hot: { new: 0.2, contacted: 0.4, qualified: 0.7, proposal: 0.8 }
  };
  
  let predictedConversions = 0;
  
  leads.forEach(lead => {
    if (lead.status !== 'closed') {
      const rate = conversionRates[lead.score]?.[lead.status] || 0.1;
      predictedConversions += rate;
    }
  });
  
  return Math.round(predictedConversions);
};

export const getRecommendedActions = (leads: LeadData[]): { leadId: string, action: string }[] => {
  // Recommend next actions for leads
  const recommendations: { leadId: string, action: string }[] = [];
  
  leads.forEach(lead => {
    // Simple decision tree for recommendations
    if (lead.status === 'new' && lead.score === 'hot') {
      recommendations.push({ 
        leadId: lead.id, 
        action: "Immediate follow-up call recommended" 
      });
    } else if (lead.status === 'contacted' && (lead.score === 'warm' || lead.score === 'hot')) {
      recommendations.push({ 
        leadId: lead.id, 
        action: "Schedule a demo/presentation" 
      });
    } else if (lead.status === 'qualified') {
      recommendations.push({ 
        leadId: lead.id, 
        action: "Prepare and send proposal" 
      });
    } else if (lead.status === 'proposal' && lead.score === 'hot') {
      recommendations.push({ 
        leadId: lead.id, 
        action: "Follow-up on proposal status" 
      });
    }
  });
  
  return recommendations;
};

export const getLeadsInsights = (leads: LeadData[]) => {
  // Get overall insights from leads data
  if (!leads.length) return null;
  
  const qualityScore = analyzeLeadQuality(leads);
  const predictedConversions = getPredictedConversions(leads);
  const recommendations = getRecommendedActions(leads);
  
  // Distribution by source
  const sourceDistribution = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.source] = (acc[lead.source] || 0) + 1;
    return acc;
  }, {});
  
  // Distribution by score
  const scoreDistribution = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.score] = (acc[lead.score] || 0) + 1;
    return acc;
  }, {});
  
  return {
    qualityScore,
    predictedConversions,
    recommendations,
    sourceDistribution,
    scoreDistribution,
  };
};
