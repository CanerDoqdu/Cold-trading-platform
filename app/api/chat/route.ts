import { NextRequest, NextResponse } from 'next/server';

// Crypto knowledge base for Liva AI (fallback)
const cryptoKnowledge = {
  bitcoin: {
    description: "Bitcoin (BTC) is the first and most well-known cryptocurrency, created in 2009 by Satoshi Nakamoto.",
    use_case: "Store of value, digital gold, peer-to-peer payments",
    tips: "Bitcoin is often considered a hedge against inflation. Consider dollar-cost averaging (DCA) for long-term investment."
  },
  ethereum: {
    description: "Ethereum (ETH) is a decentralized platform for smart contracts and dApps.",
    use_case: "Smart contracts, DeFi, NFTs, dApps",
    tips: "ETH is essential for gas fees on the Ethereum network. Watch for network upgrades that may affect gas costs."
  },
  trading: {
    tips: [
      "Never invest more than you can afford to lose",
      "Use stop-loss orders to manage risk",
      "Dollar-cost averaging (DCA) reduces timing risk",
      "Don't chase pumps - FOMO is your enemy",
      "Take profits on the way up",
      "Diversify your portfolio across multiple assets"
    ]
  },
  defi: {
    description: "DeFi (Decentralized Finance) refers to financial services built on blockchain without intermediaries.",
    examples: "Lending (Aave, Compound), DEXs (Uniswap, Curve), Yield farming",
    risks: "Smart contract risks, impermanent loss, rug pulls"
  },
  nft: {
    description: "NFTs (Non-Fungible Tokens) are unique digital assets verified on blockchain.",
    use_case: "Digital art, collectibles, gaming items, membership tokens",
    tips: "Research the project team, utility, and community before buying."
  }
};

// AI response generator
function generateResponse(message: string, history: any[]): string {
  const lowerMessage = message.toLowerCase();
  
  // Greeting patterns
  if (lowerMessage.match(/^(hi|hello|hey|merhaba|selam)/)) {
    return "Hello! 👋 I'm Liva, your crypto assistant. How can I help you today? You can ask me about:\n\n• Market analysis\n• Trading strategies\n• Specific cryptocurrencies\n• DeFi & NFTs\n• Portfolio tips";
  }
  
  // Bitcoin questions
  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
    if (lowerMessage.includes('price') || lowerMessage.includes('worth')) {
      return "I don't have real-time prices, but you can check the current Bitcoin price on our Markets page! 📊\n\nFor price predictions, remember: crypto is highly volatile. Focus on fundamentals and your investment thesis rather than short-term price movements.";
    }
    if (lowerMessage.includes('buy') || lowerMessage.includes('invest')) {
      return `**Bitcoin Investment Tips:**\n\n${cryptoKnowledge.bitcoin.tips}\n\n⚠️ Remember: This is not financial advice. Always do your own research (DYOR) and consider your risk tolerance.`;
    }
    return `**About Bitcoin:**\n\n${cryptoKnowledge.bitcoin.description}\n\n**Use Cases:** ${cryptoKnowledge.bitcoin.use_case}\n\n💡 ${cryptoKnowledge.bitcoin.tips}`;
  }
  
  // Ethereum questions
  if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
    if (lowerMessage.includes('gas')) {
      return "**ETH Gas Fees:**\n\nGas fees on Ethereum fluctuate based on network demand. Here are some tips:\n\n• Check gas prices before transacting\n• Use Layer 2 solutions (Arbitrum, Optimism) for lower fees\n• Schedule transactions during low-activity periods\n• Consider using gas tracking tools";
    }
    return `**About Ethereum:**\n\n${cryptoKnowledge.ethereum.description}\n\n**Use Cases:** ${cryptoKnowledge.ethereum.use_case}\n\n💡 ${cryptoKnowledge.ethereum.tips}`;
  }
  
  // Trading advice
  if (lowerMessage.match(/trad(e|ing)|buy|sell|invest/)) {
    const tips = cryptoKnowledge.trading.tips;
    const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3);
    return `**Trading Tips:**\n\n${randomTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n📈 Check our Trade page for real-time charts and order placement.\n\n⚠️ This is educational content, not financial advice.`;
  }
  
  // DeFi questions
  if (lowerMessage.includes('defi') || lowerMessage.includes('yield') || lowerMessage.includes('staking')) {
    return `**DeFi Overview:**\n\n${cryptoKnowledge.defi.description}\n\n**Popular Protocols:** ${cryptoKnowledge.defi.examples}\n\n⚠️ **Risks:** ${cryptoKnowledge.defi.risks}\n\nAlways research thoroughly before participating in DeFi protocols!`;
  }
  
  // NFT questions
  if (lowerMessage.includes('nft')) {
    return `**NFT Overview:**\n\n${cryptoKnowledge.nft.description}\n\n**Use Cases:** ${cryptoKnowledge.nft.use_case}\n\n💡 ${cryptoKnowledge.nft.tips}\n\nCheck out our NFT Rankings page to discover trending collections!`;
  }
  
  // Portfolio advice
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('diversif')) {
    return "**Portfolio Tips:**\n\n1. **Diversify** - Don't put all eggs in one basket\n2. **Core Holdings** - Consider BTC & ETH as foundation (50-70%)\n3. **Altcoins** - Allocate smaller % to higher-risk alts\n4. **Stablecoins** - Keep some for opportunities\n5. **Rebalance** - Review quarterly\n\nVisit your Portfolio page to track your holdings! 📊";
  }
  
  // Market analysis
  if (lowerMessage.includes('market') || lowerMessage.includes('analysis') || lowerMessage.includes('trend')) {
    return "**Market Analysis Tips:**\n\n• Check Bitcoin dominance for market sentiment\n• Watch trading volume for trend confirmation\n• Monitor Fear & Greed Index\n• Follow on-chain metrics for deeper insights\n• Keep up with macro news (Fed, regulations)\n\nVisit our Markets page for real-time data! 📊";
  }
  
  // Help / What can you do
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
    return "I'm Liva, your AI crypto assistant! Here's how I can help:\n\n🔹 **Market Insights** - Ask about trends, analysis\n🔹 **Crypto Info** - BTC, ETH, altcoins, DeFi, NFTs\n🔹 **Trading Tips** - Strategies, risk management\n🔹 **Portfolio Advice** - Diversification, allocation\n🔹 **Education** - Explain crypto concepts\n\nJust type your question and I'll do my best to help!";
  }
  
  // Thanks
  if (lowerMessage.match(/thank|thanks|thx/)) {
    return "You're welcome! 😊 Feel free to ask if you have more questions. Happy trading! 🚀";
  }
  
  // Goodbye
  if (lowerMessage.match(/bye|goodbye|see you/)) {
    return "Goodbye! 👋 Remember to DYOR and trade safely. See you next time! 🚀";
  }
  
  // Default response for unknown queries
  return "That's an interesting question! While I'm still learning, here are some ways I can help:\n\n• Ask about specific cryptocurrencies (Bitcoin, Ethereum, etc.)\n• Get trading tips and strategies\n• Learn about DeFi and NFTs\n• Get portfolio management advice\n\nTry rephrasing your question or ask about one of these topics! 💡";
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    let response: string = '';
    
    // Try OpenRouter with multiple free models (fallback chain)
    if (process.env.OPENROUTER_API_KEY) {
      // These are confirmed working free models on OpenRouter as of 2026
      const freeModels = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemini-2.0-flash-exp:free',
      ];
      
      const systemPrompt = `You are Liva, a friendly and knowledgeable AI crypto assistant for a crypto trading platform. You help users with:
- Crypto market analysis and insights
- Trading strategies and tips (risk management, DCA, portfolio diversification)
- Explanations of cryptocurrencies (Bitcoin, Ethereum, altcoins, DeFi, NFTs)
- Educational content about blockchain and crypto
- Portfolio management advice

Be conversational, helpful, and always remind users that you provide educational content, not financial advice. Keep responses concise (under 150 words). Use emojis occasionally for friendliness. If the user asks about current prices, direct them to the Markets page.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: message }
      ];

      let success = false;
      
      for (const model of freeModels) {
        if (success) break;
        
        try {
          console.log(`Trying model: ${model}`);
          
          const orResponse = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
                'X-Title': 'Crypto Liva Chat',
              },
              body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 300,
                temperature: 0.7,
              }),
            }
          );

          const data = await orResponse.json();
          console.log(`Model ${model} response:`, orResponse.status, JSON.stringify(data).slice(0, 200));

          if (orResponse.ok && data.choices?.[0]?.message?.content) {
            response = data.choices[0].message.content;
            success = true;
            console.log(`✅ OpenRouter success with model: ${model}`);
          } else {
            console.warn(`Model ${model} failed:`, data.error?.message || 'No content');
          }
        } catch (err) {
          console.warn(`Model ${model} error:`, err);
        }
      }
      
      if (!success) {
        console.warn('All OpenRouter models failed, using rule-based fallback');
        response = generateResponse(message, history || []);
      }
    } else {
      // Fallback if no API key
      response = generateResponse(message, history || []);
    }

    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
