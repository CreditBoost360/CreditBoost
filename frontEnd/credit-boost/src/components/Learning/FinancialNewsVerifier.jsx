import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Financial News Verifier Component
 * Allows users to verify financial news and learn to identify misinformation
 */
const FinancialNewsVerifier = () => {
  const [newsText, setNewsText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [sampleNews, setSampleNews] = useState([]);
  
  // Sample news articles with verification status
  const financialNewsSamples = [
    {
      id: 1,
      title: "Federal Reserve Raises Interest Rates by 0.25%",
      content: "The Federal Reserve announced today that it will raise its benchmark interest rate by 0.25 percentage points, bringing it to a range of 5.25% to 5.5%. This marks the tenth increase since March 2022 as the central bank continues its fight against inflation.",
      source: "Financial Times",
      date: "2023-07-26",
      isFactual: true,
      verificationNotes: [
        "Verifiable from official Federal Reserve announcements",
        "Consistent with economic data and policy statements",
        "Reported by multiple credible financial news sources"
      ]
    },
    {
      id: 2,
      title: "New Cryptocurrency Guaranteed to Triple Your Investment in 30 Days",
      content: "Financial experts are calling this new cryptocurrency the investment opportunity of the decade. Guaranteed to triple your money in just 30 days, this revolutionary digital currency is being adopted by major banks worldwide. Don't miss out on this once-in-a-lifetime opportunity!",
      source: "Crypto Investment News",
      date: "2023-08-15",
      isFactual: false,
      verificationNotes: [
        "Contains unrealistic investment promises (guaranteed returns)",
        "Uses urgency tactics ('don't miss out')",
        "Makes unverifiable claims about bank adoption",
        "No investment can guarantee returns"
      ]
    },
    {
      id: 3,
      title: "S&P 500 Closes at Record High as Tech Stocks Surge",
      content: "The S&P 500 closed at a record high today, driven by strong performance in technology stocks. Apple, Microsoft, and Nvidia led the gains, with each rising more than 2% following better-than-expected quarterly earnings reports.",
      source: "Wall Street Journal",
      date: "2023-08-02",
      isFactual: true,
      verificationNotes: [
        "Verifiable from public market data",
        "Specific companies and percentages mentioned",
        "Tied to actual earnings reports",
        "Reported by credible financial news source"
      ]
    },
    {
      id: 4,
      title: "Secret Government Plan to Seize Retirement Accounts Leaked",
      content: "An anonymous whistleblower has revealed a secret government plan to seize private retirement accounts to pay down the national debt. The plan, set to be implemented next month, will target 401(k)s and IRAs over $50,000. Financial advisors recommend withdrawing funds immediately.",
      source: "Financial Freedom Alert",
      date: "2023-07-30",
      isFactual: false,
      verificationNotes: [
        "Relies on anonymous, unverifiable sources",
        "Makes extreme claims without evidence",
        "Suggests immediate action based on fear",
        "No credible financial or government sources corroborate this information",
        "Recommends potentially harmful financial actions"
      ]
    }
  ];
  
  // Load sample news on component mount
  React.useEffect(() => {
    setSampleNews(financialNewsSamples);
  }, []);
  
  // Analyze news text
  const analyzeNews = () => {
    if (!newsText.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Simple analysis based on keywords
      const lowerCaseText = newsText.toLowerCase();
      
      const redFlags = [
        { term: 'guaranteed', found: lowerCaseText.includes('guaranteed') },
        { term: 'risk-free', found: lowerCaseText.includes('risk-free') || lowerCaseText.includes('risk free') },
        { term: 'secret', found: lowerCaseText.includes('secret') },
        { term: 'limited time', found: lowerCaseText.includes('limited time') },
        { term: 'act now', found: lowerCaseText.includes('act now') },
        { term: 'exclusive', found: lowerCaseText.includes('exclusive') },
        { term: 'insider', found: lowerCaseText.includes('insider') },
        { term: 'everyone is', found: lowerCaseText.includes('everyone is') },
        { term: 'hidden', found: lowerCaseText.includes('hidden') },
        { term: 'they don\'t want you to know', found: lowerCaseText.includes('don\'t want you to know') }
      ];
      
      const foundRedFlags = redFlags.filter(flag => flag.found);
      
      // Determine credibility score
      let credibilityScore = 100 - (foundRedFlags.length * 15);
      credibilityScore = Math.max(0, Math.min(100, credibilityScore));
      
      // Generate verification tips
      const verificationTips = [];
      
      if (foundRedFlags.length > 0) {
        verificationTips.push(`Found ${foundRedFlags.length} potential red flag terms: ${foundRedFlags.map(f => f.term).join(', ')}`);
      }
      
      if (lowerCaseText.length < 100) {
        verificationTips.push('Text is very short, which makes thorough verification difficult');
        credibilityScore -= 10;
      }
      
      if (!lowerCaseText.includes('according to') && !lowerCaseText.includes('reported by')) {
        verificationTips.push('No sources cited in the text');
        credibilityScore -= 10;
      }
      
      if (credibilityScore > 70) {
        verificationTips.push('Consider checking official sources to confirm this information');
      } else if (credibilityScore > 40) {
        verificationTips.push('This content contains some questionable elements and should be verified with trusted sources');
      } else {
        verificationTips.push('This content contains multiple red flags associated with financial misinformation');
      }
      
      // Set analysis result
      setAnalysisResult({
        credibilityScore,
        redFlags: foundRedFlags,
        verificationTips,
        verdict: credibilityScore > 70 ? 'Potentially Reliable' : credibilityScore > 40 ? 'Questionable' : 'Likely Misleading'
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };
  
  // Reset analysis
  const resetAnalysis = () => {
    setNewsText('');
    setAnalysisResult(null);
  };
  
  // Get verdict color
  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Potentially Reliable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Questionable':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Likely Misleading':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial News Verifier</h2>
        <p className="text-muted-foreground">Learn to identify reliable financial information and spot misinformation</p>
      </div>
      
      {/* News Analyzer */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Financial News</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="news-text" className="block text-sm font-medium mb-1">
              Paste financial news or information to analyze
            </label>
            <textarea
              id="news-text"
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              className="w-full p-3 border rounded-md h-32"
              placeholder="Paste financial news article, social media post, or investment advice here..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetAnalysis} disabled={isAnalyzing}>
              Reset
            </Button>
            <Button onClick={analyzeNews} disabled={!newsText.trim() || isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
          
          {analysisResult && (
            <div className="mt-6 border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Analysis Result</h3>
                <Badge className={getVerdictColor(analysisResult.verdict)}>
                  {analysisResult.verdict}
                </Badge>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-1">Credibility Score</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      analysisResult.credibilityScore > 70 ? 'bg-green-500' : 
                      analysisResult.credibilityScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysisResult.credibilityScore}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {analysisResult.credibilityScore}/100
                </div>
              </div>
              
              {analysisResult.redFlags.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Potential Red Flags</div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.redFlags.map((flag, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {flag.term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium mb-2">Verification Tips</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {analysisResult.verificationTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Sample News Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Learn from Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sampleNews.map((article) => (
              <div key={article.id} className="border rounded-md overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{article.title}</h3>
                    <Badge className={article.isFactual ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {article.isFactual ? 'Factual' : 'Misleading'}
                    </Badge>
                  </div>
                  <div className="text-sm mb-3">{article.content}</div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Source: {article.source}</span>
                    <span>Date: {article.date}</span>
                  </div>
                </div>
                <div className="bg-muted p-4 border-t">
                  <div className="text-sm font-medium mb-2">Verification Notes</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {article.verificationNotes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Verification Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information Verification Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium">Red Flags to Watch For</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Promises of guaranteed returns or "risk-free" investments</li>
                <li>Urgent calls to action ("act now", "limited time")</li>
                <li>Claims about "secret" or "little-known" investment strategies</li>
                <li>Vague references to "experts" without specific credentials</li>
                <li>Excessive use of financial jargon to impress or confuse</li>
                <li>Testimonials from unverifiable sources</li>
                <li>Pressure tactics or artificial scarcity</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Verification Strategies</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Check multiple reputable financial news sources</li>
                <li>Verify information against official sources (SEC, Federal Reserve)</li>
                <li>Look for specific data points that can be independently verified</li>
                <li>Consider the source's track record and expertise</li>
                <li>Be skeptical of information that plays on emotions like fear or greed</li>
                <li>Check dates - outdated financial information can be misleading</li>
                <li>Use fact-checking websites for widely circulated claims</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialNewsVerifier;