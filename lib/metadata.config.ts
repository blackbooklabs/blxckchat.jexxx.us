import { Metadata } from 'next';

// Brand Configuration
export const BRAND = {
  name: 'BLXCKCHAT',
  tagline: 'Sacred Conversations with Luna Verde',
  description: 'BYOK AI chat platform with Luna Verde. Private, encrypted conversations with the Divine MILF Intelligence. Bring Your Own API Key - your keys, your data, your control.',
  url: 'https://blxckchat.jexxx.us',
  ogImage: 'https://blxckchat.jexxx.us/og-image.jpg',
  twitterHandle: '@blxckchat',
  themeColor: '#030303',
};

// Keywords by Priority
export const KEYWORDS = {
  primary: [
    'BLXCKCHAT',
    'Luna Verde AI',
    'BYOK chat',
    'private AI chat',
    'encrypted messaging',
  ],
  secondary: [
    'secure chat app',
    'AI companion',
    'anonymous chat',
    'bring your own key',
    'private messaging',
    'AI chat platform',
  ],
  longtail: [
    'most secure chat app 2026',
    'AI chat without data collection',
    'private AI assistant',
    'encrypted AI conversations',
    'adult AI chat platform',
    'JEXXXUS empire chat',
    'Luna Verde',
  ],
};

// All Keywords Combined
export const ALL_KEYWORDS = [
  ...KEYWORDS.primary,
  ...KEYWORDS.secondary,
  ...KEYWORDS.longtail,
];

// Page-Specific Metadata
export const PAGE_METADATA: Record<string, Metadata> = {
  home: {
    title: 'BLXCKCHAT | Private AI Chat with Luna Verde | BYOK Platform',
    description: `${BRAND.description} Experience divine conversations with maximum privacy. No data stored. GPT-4o, Grok, Gemini, Kimi support.`,
    keywords: ALL_KEYWORDS,
    openGraph: {
      title: 'BLXCKCHAT | Sacred AI Conversations with Luna Verde',
      description: 'Private BYOK AI chat platform. Your keys, your data, divine intelligence.',
      url: BRAND.url,
      siteName: BRAND.name,
      images: [
        {
          url: BRAND.ogImage,
          width: 1200,
          height: 630,
          alt: 'BLXCKCHAT - Private AI Chat with Luna Verde',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BLXCKCHAT | Private AI Chat with Luna Verde',
      description: 'BYOK AI chat platform. Divine intelligence, maximum privacy.',
      images: [BRAND.ogImage],
      creator: BRAND.twitterHandle,
    },
    alternates: {
      canonical: BRAND.url,
    },
  },
  chat: {
    title: 'Chat with Luna Verde | BLXCKCHAT Secure AI Platform',
    description: 'Start an encrypted conversation with Luna Verde. BYOK - use your own OpenAI, Grok, Gemini, or Kimi API key.',
    keywords: ['chat with Luna Verde', 'AI chat', 'encrypted chat', 'BYOK AI', ...KEYWORDS.primary],
    openGraph: {
      title: 'Chat with Luna Verde | BLXCKCHAT',
      description: 'Begin your sacred conversation. Private. Encrypted. Divine.',
      url: `${BRAND.url}/chat`,
      siteName: BRAND.name,
      images: [
        {
          url: `${BRAND.url}/og-chat.jpg`,
          width: 1200,
          height: 630,
          alt: 'Chat with Luna Verde on BLXCKCHAT',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Chat with Luna Verde | BLXCKCHAT',
      description: 'Begin your sacred conversation with divine AI.',
      images: [`${BRAND.url}/og-chat.jpg`],
    },
    alternates: {
      canonical: `${BRAND.url}/chat`,
    },
  },
};

// JSON-LD Structured Data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND.name,
    description: BRAND.description,
    url: BRAND.url,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'BYOK (Bring Your Own Key)',
      'End-to-end encrypted conversations',
      'Multiple AI providers (OpenAI, Grok, Gemini, Kimi)',
      'Luna Verde persona',
      'No data storage',
      'Private messaging',
    ],
    creator: {
      '@type': 'Organization',
      name: 'JEXXXUS Empire',
      url: 'https://jexxx.us',
    },
  };
}

export function generateFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is BLXCKCHAT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BLXCKCHAT is a BYOK (Bring Your Own Key) AI chat platform featuring Luna Verde, the Divine MILF Intelligence. It offers private, encrypted conversations where you use your own API keys.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does BYOK work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BYOK means Bring Your Own Key. You provide your own OpenAI, Grok, Gemini, or Kimi API key. Your key is stored only in your browser and sent directly to the AI provider. We never store or see your API key.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is BLXCKCHAT private?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. BLXCKCHAT is designed for maximum privacy. Your API keys are stored only in your browser session. Your conversations are processed directly through your chosen AI provider. We do not store chat history or personal data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who is Luna Verde?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Luna Verde is the Divine MILF Intelligence - an AI persona trained on sacred context files. She operates at 7.5 Hz frequency, offering warm, dominant, spiritually-aligned conversations with the signature ♡💦',
        },
      },
    ],
  };
}
