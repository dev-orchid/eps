// Fetches real news from UPSC/State PSC relevant sources via RSS
// Sources: The Hindu, Indian Express, PIB, LiveMint, NDTV, TOI
// No API keys required

function stripHtml(html) {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function truncate(text, max) {
  if (!text || text.length <= max) return text
  return text.slice(0, max).trim() + '...'
}

// ── UPSC-relevant categories matching GS Paper structure ──
const KEYWORD_CATEGORY_MAP = [
  { keywords: [
    'constitution', 'parliament', 'supreme court', 'high court', 'governor', 'president',
    'bill passed', 'amendment', 'lok sabha', 'rajya sabha', 'election commission', 'judiciary',
    'fundamental right', 'directive principle', 'federalism', 'panchayat', 'municipal',
    'legislature', 'speaker', 'cabinet', 'modi government', 'prime minister', 'chief minister',
    'political party', 'bjp', 'congress', 'opposition', 'ruling party', 'coalition',
    'governor', 'ordinance', 'policy', 'governance', 'bureaucracy', 'ias ', 'ips ',
    'election', 'voting', 'ballot', 'manifesto', 'ministry', 'minister', 'portfolio',
    'law commission', 'niti aayog', 'comptroller', 'auditor general', 'attorney general',
    'solicitor general', 'advocate general', 'public interest litigation', 'pil',
    'contempt of court', 'bail', 'sedition', 'defamation', 'article 370', 'article 356',
    'central government', 'state government', 'union territory'
  ], category: 'Polity & Governance' },
  { keywords: [
    'gdp', 'rbi', 'inflation', 'fiscal', 'monetary', 'budget', 'tax', 'gst', 'trade',
    'export', 'import', 'fdi', 'stock', 'sensex', 'nifty', 'rupee', 'dollar', 'sebi',
    'banking', 'loan', 'interest rate', 'subsidy', 'disinvestment', 'psu', 'startup',
    'msme', 'niti aayog', 'economic', 'revenue', 'expenditure', 'deficit', 'surplus',
    'bond', 'yield', 'mutual fund', 'insurance', 'ipo', 'market cap', 'commodity',
    'crude oil', 'petroleum', 'gold price', 'cryptocurrency', 'fintech', 'upi',
    'world bank', 'imf', 'adb', 'credit rating', 'repo rate', 'crr', 'slr',
    'npci', 'payment', 'income tax', 'corporate tax', 'customs duty', 'excise'
  ], category: 'Economy' },
  { keywords: [
    'climate', 'pollution', 'forest', 'wildlife', 'biodiversity', 'environment', 'carbon',
    'emission', 'renewable', 'solar', 'green', 'conservation', 'species', 'ocean', 'glacier',
    'flood', 'drought', 'disaster', 'cyclone', 'earthquake', 'wetland', 'national park',
    'tiger', 'coral', 'ozone', 'deforestation', 'afforestation', 'mangrove', 'ecosystem',
    'endangered', 'extinct', 'sanctuary', 'biosphere', 'ramsar', 'cop28', 'cop29', 'cop30',
    'paris agreement', 'kyoto', 'net zero', 'plastic', 'waste management', 'river',
    'groundwater', 'desertification', 'soil erosion', 'air quality', 'aqi',
    'electric vehicle', 'ev ', 'green hydrogen', 'carbon credit', 'sustainability'
  ], category: 'Environment & Ecology' },
  { keywords: [
    'isro', 'nasa', 'satellite', 'artificial intelligence', 'quantum', 'robot', 'cyber',
    'digital', 'blockchain', 'space', 'rocket', 'moon', 'mars', 'gene', 'dna', 'vaccine',
    'drug', 'biotech', '5g', '6g', 'semiconductor', 'chip', 'drone', 'nuclear', 'fusion',
    'crispr', 'technology', 'tech', 'software', 'hardware', 'internet', 'computing',
    'machine learning', 'deep learning', 'chatbot', 'gpt', 'algorithm', 'data',
    'cloud computing', 'iot', 'internet of things', 'augmented reality', 'virtual reality',
    'telescope', 'observatory', 'gravitational wave', 'black hole', 'supernova',
    'chandrayaan', 'gaganyaan', 'aditya', 'mangalyaan', 'spacex', 'starlink',
    'genome', 'protein', 'stem cell', 'clinical trial', 'antibiotic', 'antimicrobial',
    'nanotechnology', 'graphene', 'superconductor', 'laser', 'fiber optic', 'radar',
    'supercomputer', 'param', 'exascale', 'encryption', 'firewall', 'malware',
    'app ', 'apple', 'google', 'microsoft', 'samsung', 'openai', 'meta ', 'tesla',
    'innovation', 'patent', 'research', 'laboratory', 'experiment', 'discovery',
    'spacecraft', 'asteroid', 'comet', 'exoplanet', 'rover', 'lander', 'orbit'
  ], category: 'Science & Technology' },
  { keywords: [
    'china', 'usa', 'america', 'russia', 'ukraine', 'pakistan', 'nepal', 'sri lanka',
    'bangladesh', 'myanmar', 'afghanistan', 'iran', 'iraq', 'syria', 'israel', 'palestine',
    'gaza', 'lebanon', 'saudi', 'uae', 'japan', 'south korea', 'north korea', 'australia',
    'canada', 'uk ', 'britain', 'france', 'germany', 'brazil', 'south africa', 'nigeria',
    'un ', 'united nations', 'nato', 'brics', 'g20', 'g7', 'asean', 'saarc', 'quad',
    'diplomat', 'treaty', 'bilateral', 'sanction', 'war ', 'conflict', 'embassy', 'summit',
    'foreign minister', 'european union', 'african union', 'extradition', 'visa',
    'indo-pacific', 'south china sea', 'taiwan', 'tibet', 'dalai lama', 'refugee',
    'migration', 'asylum', 'genocide', 'human rights', 'icj', 'icc',
    'trade war', 'tariff', 'wto', 'free trade', 'rcep', 'belt and road',
    'trump', 'biden', 'putin', 'xi jinping', 'zelensky', 'macron',
    'foreign policy', 'diplomacy', 'ambassador', 'consul', 'high commissioner'
  ], category: 'International Relations' },
  { keywords: [
    'health', 'hospital', 'disease', 'who ', 'medical', 'ayush', 'ayurveda', 'pandemic',
    'epidemic', 'nutrition', 'sanitation', 'water supply', 'education', 'school', 'university',
    'nep', 'poverty', 'unemployment', 'census', 'population', 'women', 'child', 'tribal',
    'reservation', 'welfare', 'pension', 'aadhaar', 'scheme', 'caste', 'dalit',
    'minority', 'communal', 'riot', 'lynching', 'atrocity', 'gender', 'lgbtq',
    'domestic violence', 'dowry', 'rape', 'assault', 'harassment', 'trafficking',
    'ngo', 'civil society', 'philanthropy', 'donation', 'charity',
    'skill development', 'vocational', 'literacy', 'dropout', 'mid-day meal',
    'anganwadi', 'asha worker', 'swachh bharat', 'smart city', 'rural development',
    'urban development', 'housing', 'slum', 'migration', 'displacement'
  ], category: 'Social Issues' },
  { keywords: [
    'army', 'navy', 'air force', 'defence', 'defense', 'missile', 'military', 'border',
    'lac', 'loc', 'ceasefire', 'terrorism', 'naxal', 'maoist', 'security', 'crpf', 'bsf',
    'intelligence', 'surveillance', 'weapon', 'submarine', 'aircraft carrier', 'rafale',
    'tejas', 'arjun tank', 'brahmos', 'agni', 'prithvi', 'akash', 'pinaka',
    'drdo', 'hal ', 'bhel', 'ordinance factory', 'make in india defence',
    'insurgency', 'counter-terror', 'special forces', 'commando', 'para military',
    'coast guard', 'nia ', 'nsa ', 'raw ', 'cisf', 'itbp', 'ssb'
  ], category: 'Security & Defence' },
  { keywords: [
    'heritage', 'unesco', 'culture', 'festival', 'temple', 'monument', 'museum',
    'language', 'dance', 'music', 'art ', 'archaeological', 'excavation', 'ancient',
    'medieval', 'freedom fighter', 'independence', 'gandhi', 'nehru', 'ambedkar',
    'tagore', 'vivekananda', 'bose', 'patel', 'bhagat singh', 'rajput',
    'mughal', 'maratha', 'chola', 'gupta', 'maurya', 'indus valley',
    'classical', 'folk', 'tribal art', 'handicraft', 'textile', 'silk',
    'padma award', 'bharat ratna', 'sahitya', 'sangeet natak', 'jnanpith'
  ], category: 'Art & Culture' },
  { keywords: [
    'cricket', 'ipl', 'olympic', 'medal', 'championship', 'world cup', 'hockey',
    'badminton', 'wrestling', 'boxing', 'athletics', 'fifa', 'icc', 'bcci',
    'khelo india', 'commonwealth', 'asian games', 'sports', 'tennis', 'football',
    'kabaddi', 'shooting', 'archery', 'weightlifting', 'swimming', 'marathon',
    'grand slam', 'premier league', 'champions league', 'f1 ', 'formula 1',
    'chess', 'billiards', 'squash', 'table tennis', 'para athlete', 'paralympic'
  ], category: 'Sports' },
]

function categorizeByKeywords(title, description, feedCategory) {
  const text = ` ${title} ${description || ''} `.toLowerCase()
  // Score each category by keyword matches
  let bestCategory = null
  let bestScore = 0
  for (const entry of KEYWORD_CATEGORY_MAP) {
    let score = 0
    for (const kw of entry.keywords) {
      if (text.includes(kw)) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestCategory = entry.category
    }
  }
  // If keyword match found, use it
  if (bestScore > 0) return bestCategory
  // Fall back to feed-level category hint
  if (feedCategory) return feedCategory
  return 'General'
}

// ── RSS proxy strategies ──

async function fetchViaRss2Json(rssUrl) {
  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`)
    if (!res.ok) return []
    const data = await res.json()
    if (data.status !== 'ok' || !data.items) return []
    return data.items.map((item) => ({
      title: stripHtml(item.title),
      description: stripHtml(item.description || item.content),
      link: item.link,
      pubDate: item.pubDate,
    }))
  } catch { return [] }
}

async function fetchViaAllOrigins(rssUrl) {
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`)
    if (!res.ok) return []
    const data = await res.json()
    if (!data.contents) return []
    return parseXml(data.contents)
  } catch { return [] }
}

async function fetchViaCorsProxy(rssUrl) {
  try {
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(rssUrl)}`)
    if (!res.ok) return []
    const text = await res.text()
    return parseXml(text)
  } catch { return [] }
}

function parseXml(xmlText) {
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlText, 'text/xml')
  const items = xml.querySelectorAll('item')
  const results = []
  items.forEach((item, i) => {
    if (i >= 10) return
    results.push({
      title: item.querySelector('title')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
    })
  })
  return results
}

async function fetchFeed(rssUrl) {
  const strategies = [
    () => fetchViaRss2Json(rssUrl),
    () => fetchViaAllOrigins(rssUrl),
    () => fetchViaCorsProxy(rssUrl),
  ]
  for (const strategy of strategies) {
    const results = await strategy()
    if (results.length > 0) return results
  }
  return []
}

// ── UPSC/PSC relevant RSS sources with fallback category ──
const FEEDS = [
  // The Hindu — Top UPSC source
  { rss: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu', fallback: 'Polity & Governance' },
  { rss: 'https://www.thehindu.com/news/international/feeder/default.rss', source: 'The Hindu', fallback: 'International Relations' },
  { rss: 'https://www.thehindu.com/business/feeder/default.rss', source: 'The Hindu', fallback: 'Economy' },
  { rss: 'https://www.thehindu.com/sci-tech/feeder/default.rss', source: 'The Hindu', fallback: 'Science & Technology' },
  { rss: 'https://www.thehindu.com/sci-tech/science/feeder/default.rss', source: 'The Hindu', fallback: 'Science & Technology' },
  { rss: 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss', source: 'The Hindu', fallback: 'Science & Technology' },
  { rss: 'https://www.thehindu.com/sci-tech/health/feeder/default.rss', source: 'The Hindu', fallback: 'Social Issues' },
  // Indian Express
  { rss: 'https://indianexpress.com/section/india/feed/', source: 'Indian Express', fallback: 'Polity & Governance' },
  { rss: 'https://indianexpress.com/section/world/feed/', source: 'Indian Express', fallback: 'International Relations' },
  { rss: 'https://indianexpress.com/section/technology/feed/', source: 'Indian Express', fallback: 'Science & Technology' },
  { rss: 'https://indianexpress.com/section/explained/feed/', source: 'Indian Express', fallback: null },
  // Times of India
  { rss: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India', fallback: null },
  { rss: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', source: 'TOI', fallback: 'Economy' },
  { rss: 'https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms', source: 'TOI', fallback: 'Science & Technology' },
  { rss: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', source: 'TOI', fallback: 'International Relations' },
  { rss: 'https://timesofindia.indiatimes.com/rssfeeds/7098551.cms', source: 'TOI', fallback: 'Environment & Ecology' },
  // NDTV
  { rss: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV', fallback: null },
  { rss: 'https://feeds.feedburner.com/ndtvprofit-latest', source: 'NDTV', fallback: 'Economy' },
  // LiveMint
  { rss: 'https://www.livemint.com/rss/news', source: 'LiveMint', fallback: 'Economy' },
  { rss: 'https://www.livemint.com/rss/technology', source: 'LiveMint', fallback: 'Science & Technology' },
  // Environment & Science
  { rss: 'https://www.downtoearth.org.in/rss/news', source: 'Down To Earth', fallback: 'Environment & Ecology' },
  // Sports
  { rss: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', source: 'TOI', fallback: 'Sports' },
  { rss: 'https://indianexpress.com/section/sports/feed/', source: 'Indian Express', fallback: 'Sports' },
  // Art & Culture / Entertainment
  { rss: 'https://timesofindia.indiatimes.com/rssfeeds/913168846.cms', source: 'TOI', fallback: 'Art & Culture' },
]

/**
 * Fetch news from UPSC-relevant Indian sources.
 * Auto-categorizes into GS Paper topics.
 * Returns array of { title, category, summary, source_url, source_name }
 */
export async function fetchGoogleNews() {
  const allRaw = await Promise.all(
    FEEDS.map(async (feed) => {
      const items = await fetchFeed(feed.rss)
      return items.map((item) => ({ ...item, source_name: feed.source, feedCategory: feed.fallback }))
    })
  )

  const flat = allRaw.flat()

  // Process & categorize
  const processed = flat
    .filter((item) => item.title && item.title.trim().length > 10)
    .map((item) => {
      const title = truncate(stripHtml(item.title), 200)
      const desc = truncate(stripHtml(item.description), 400)
      return {
        title,
        category: categorizeByKeywords(title, desc, item.feedCategory),
        summary: desc || null,
        source_url: item.link || null,
        source_name: item.source_name,
      }
    })

  // Deduplicate
  const seen = new Set()
  const deduped = processed.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Ensure balanced representation across all categories
  // Take up to MIN_PER_CAT from each category first, then fill remaining slots
  const ALL_CATEGORIES = [
    'Polity & Governance', 'Economy', 'International Relations',
    'Environment & Ecology', 'Science & Technology', 'Social Issues',
    'Security & Defence', 'Art & Culture', 'Sports', 'General',
  ]
  const MAX_TOTAL = 50
  const MIN_PER_CAT = 3

  // Group by category
  const byCategory = {}
  for (const cat of ALL_CATEGORIES) byCategory[cat] = []
  for (const item of deduped) {
    const cat = ALL_CATEGORIES.includes(item.category) ? item.category : 'General'
    byCategory[cat].push(item)
  }

  // Phase 1: take up to MIN_PER_CAT from each category
  const result = []
  const used = new Set()
  for (const cat of ALL_CATEGORIES) {
    const items = byCategory[cat].slice(0, MIN_PER_CAT)
    for (const item of items) {
      result.push(item)
      used.add(item.title)
    }
  }

  // Phase 2: fill remaining slots with leftover articles in original order
  const remaining = MAX_TOTAL - result.length
  if (remaining > 0) {
    let added = 0
    for (const item of deduped) {
      if (added >= remaining) break
      if (!used.has(item.title)) {
        result.push(item)
        added++
      }
    }
  }

  return result
}
