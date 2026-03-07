const fs = require('fs');

const path = 'app/chat/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace interfaces
code = code.replace(
  /interface ApiConfig \{[\s\n]*provider: Provider;[\s\n]*apiKey: string;[\s\n]*model: string;[\s\n]*\}/,
  `interface ProviderState {
  apiKey: string;
  model: string;
  availableModels: string[];
}`
);

// Replace state variables
code = code.replace(
  /const \[apiConfig, setApiConfig\] = useState<ApiConfig>\(\{[\s\n]*provider: 'openai',[\s\n]*apiKey: '',[\s\n]*model: PROVIDERS\.openai\.defaultModel,[\s\n]*\}\);/,
  `const [providersConfig, setProvidersConfig] = useState<Record<Provider, ProviderState>>({
    openai: { apiKey: '', model: PROVIDERS.openai.defaultModel, availableModels: PROVIDERS.openai.models },
    grok: { apiKey: '', model: PROVIDERS.grok.defaultModel, availableModels: PROVIDERS.grok.models },
    gemini: { apiKey: '', model: PROVIDERS.gemini.defaultModel, availableModels: PROVIDERS.gemini.models },
    kimi: { apiKey: '', model: PROVIDERS.kimi.defaultModel, availableModels: PROVIDERS.kimi.models },
  });
  const [activeProvider, setActiveProvider] = useState<Provider>('openai');
  const [isFetchingModels, setIsFetchingModels] = useState(false);`
);

// Replace load/save config
code = code.replace(
  /\/\/ Load saved config on mount[\s\n]*useEffect\(\(\) => \{[\s\n]*const saved = sessionStorage.getItem\('luna-api-config'\);[\s\n]*if \(saved\) \{[\s\n]*try \{[\s\n]*const parsed = JSON.parse\(saved\);[\s\n]*setApiConfig\(parsed\);[\s\n]*\} catch \(e\) \{[\s\n]*console.error\('Failed to parse saved config'\);[\s\n]*\}[\s\n]*\}[\s\n]*\}, \[\]\);[\s\n]*\/\/ Save config when changed[\s\n]*const saveConfig = \(config: ApiConfig\) => \{[\s\n]*setApiConfig\(config\);[\s\n]*sessionStorage.setItem\('luna-api-config', JSON.stringify\(config\)\);[\s\n]*\};/,
  `// Load saved config on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('luna-api-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.providersConfig) {
          setProvidersConfig(parsed.providersConfig);
          setActiveProvider(parsed.activeProvider || 'openai');
        } else if (parsed.provider) {
          // Migration from old to new schema
          setActiveProvider(parsed.provider);
          setProvidersConfig(prev => ({
            ...prev,
            [parsed.provider]: { ...prev[parsed.provider], apiKey: parsed.apiKey, model: parsed.model }
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved config');
      }
    }
  }, []);

  const saveConfig = (newActive: Provider, newConfigs: Record<Provider, ProviderState>) => {
    setActiveProvider(newActive);
    setProvidersConfig(newConfigs);
    sessionStorage.setItem('luna-api-config', JSON.stringify({ activeProvider: newActive, providersConfig: newConfigs }));
  };

  const updateProviderConfig = (provider: Provider, updates: Partial<ProviderState>) => {
    const newConfigs = {
      ...providersConfig,
      [provider]: { ...providersConfig[provider], ...updates }
    };
    saveConfig(activeProvider, newConfigs);
  };

  const fetchDynamicModels = async (providerName: Provider, key: string) => {
    if (!key || key.length < 5) return;
    setIsFetchingModels(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [HEADER_KEYS[providerName]]: key
        },
        body: JSON.stringify({ provider: providerName })
      });
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        updateProviderConfig(providerName, { availableModels: data.models, model: data.models[0] });
      }
    } catch (e) {
      console.warn("Could not fetch models", e);
    } finally {
      setIsFetchingModels(false);
    }
  };`
);

// Replace uses of apiConfig
code = code.replace(/apiConfig\.apiKey/g, 'providersConfig[activeProvider].apiKey');
code = code.replace(/apiConfig\.provider/g, 'activeProvider');
code = code.replace(/apiConfig\.model/g, 'providersConfig[activeProvider].model');
code = code.replace(/providersConfig\[activeProvider\]\.model === p\?/g, 'activeProvider === p ?');
code = code.replace(/provider: data\.provider \|\| providersConfig\[activeProvider\]\.model/g, 'provider: data.provider || provider.name');

// In dependency array
code = code.replace(/\[input, isLoading, messages, apiConfig\]/g, '[input, isLoading, messages, providersConfig, activeProvider]');

// Fix setting state references in JSX
// Provider Selection
const oldProviderSection = `<button
                          key={p}
                          onClick={() => saveConfig({ ...apiConfig, provider: p, model: PROVIDERS[p].defaultModel })}
                          className={\`p-3 rounded-xl border text-left transition-all \${
                            activeProvider === p 
                              ? \`border-accent bg-accent/10 ring-1 ring-accent\` 
                              : 'border-border hover:border-muted'
                          }\`}`;
const newProviderSection = `<button
                          key={p}
                          onClick={() => saveConfig(p, providersConfig)}
                          className={\`p-3 rounded-xl border text-left transition-all \${
                            activeProvider === p 
                              ? \`border-accent bg-accent/10 ring-1 ring-accent\` 
                              : 'border-border hover:border-muted'
                          }\`}`;
code = code.replace(oldProviderSection, newProviderSection);

const modelSectionRegex = /<div>[\s\n]*<label className="block text-sm font-medium mb-2 flex items-center justify-between">[\s\n]*<span>Model<\/span>[\s\n]*<span className="text-xs text-accent font-mono">\{provider\.models\.length\} available<\/span>[\s\n]*<\/label>[\s\n]*<div className="relative">[\s\n]*<select[\s\n]*value=\{providersConfig\[activeProvider\]\.model\}[\s\n]*onChange=\{\(e\) => saveConfig\(\{ \.\.\.apiConfig, model: e\.target\.value \}\)\}[\s\n]*className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent appearance-none font-mono text-sm"[\s\n]*>[\s\n]*\{provider\.models\.map\(\(m\) => \([\s\n]*<option key=\{m\} value=\{m\}>\{m\}<\/option>[\s\n]*\)\)\}[\s\n]*<\/select>/m;

const newModelSection = `<div>
                    <label className="block text-sm font-medium mb-2 flex items-center justify-between">
                      <span>Model</span>
                      <div className="flex items-center gap-3">
                        {isFetchingModels && <Loader2 className="w-3 h-3 animate-spin text-accent"/>}
                        <button 
                          onClick={() => fetchDynamicModels(activeProvider, providersConfig[activeProvider].apiKey)} 
                          className="text-xs text-accent hover:underline flex items-center gap-1"
                          disabled={!providersConfig[activeProvider].apiKey || isFetchingModels}
                        >
                          Refresh List
                        </button>
                        <span className="text-xs text-accent font-mono">{providersConfig[activeProvider].availableModels.length} available</span>
                      </div>
                    </label>
                    <div className="relative">
                      <select
                        value={providersConfig[activeProvider].model}
                        onChange={(e) => updateProviderConfig(activeProvider, { model: e.target.value })}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-accent appearance-none font-mono text-sm"
                      >
                        {providersConfig[activeProvider].availableModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>`;
code = code.replace(modelSectionRegex, newModelSection);

const apiKeySectionRegex = /<div>[\s\n]*<label className="block text-sm font-medium mb-2">[\s\n]*\{provider\.name\} API Key[\s\n]*<span className="text-muted font-normal ml-1">\(stored only in your browser\)<\/span>[\s\n]*<\/label>[\s\n]*<input[\s\n]*type="password"[\s\n]*value=\{providersConfig\[activeProvider\]\.apiKey\}[\s\n]*onChange=\{\(e\) => saveConfig\(\{ \.\.\.apiConfig, apiKey: e\.target\.value \}\)\}[\s\n]*placeholder=""/m;

const newApiKeySection = `<div>
                    <label className="block text-sm font-medium mb-2">
                      {provider.name} API Key
                      <span className="text-muted font-normal ml-1">(stored only in your browser)</span>
                    </label>
                    <input
                      type="password"
                      value={providersConfig[activeProvider].apiKey}
                      onChange={(e) => updateProviderConfig(activeProvider, { apiKey: e.target.value })}
                      placeholder={provider.keyPlaceholder}`;
code = code.replace(apiKeySectionRegex, newApiKeySection);


const statusSectionRegex = /<div className=\{`p-3 rounded-xl \$\{isConfigured \? 'bg-green-500\/10 border border-green-500\/30' : 'bg-yellow-500\/10 border border-yellow-500\/30'\}`\}>[\s\n]*<p className=\{`text-sm \$\{isConfigured \? 'text-green-400' : 'text-yellow-400'\}`\}>[\s\n]*\{isConfigured[\s\n]*\? `✓ Connected to \$\{provider\.name\}`[\s\n]*: '⚠ Add your API key to begin communion'\}[\s\n]*<\/p>[\s\n]*<\/div>/m;

const newStatusSection = `{(() => {
                    const hasKey = !!providersConfig[activeProvider].apiKey;
                    return (
                      <div className={\`p-3 rounded-xl \${hasKey ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}\`}>
                        <p className={\`text-sm \${hasKey ? 'text-green-400' : 'text-yellow-400'}\`}>
                          {hasKey ? \`✓ Key set for \${provider.name}\` : '⚠ Add your API key to begin communion'}
                        </p>
                      </div>
                    );
                  })()}`;
code = code.replace(statusSectionRegex, newStatusSection);

fs.writeFileSync(path, code);
