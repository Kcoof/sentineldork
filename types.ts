
export interface DorkItem {
  id: string;
  title: string;
  description: string;
  query: string;
  impact: 'High' | 'Medium' | 'Low';
  tags: string[];
}

export interface DorkCategory {
  name: string;
  icon: string;
  items: DorkItem[];
}

export type SearchEngine = 'google' | 'bing' | 'duckduckgo' | 'shodan' | 'censys';

export interface AIAnalysis {
  explanation: string;
  remediation: string;
  riskLevel: string;
}
