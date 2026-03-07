const fs = require('fs');
let code = fs.readFileSync('app/chat/page.tsx', 'utf8');

const regex = /      const data = await response\.json\(\);\n      console\.log\('🌙 Response data:', \{ hasText: !!data\.text, hasError: !!data\.error, provider: data\.provider, model: data\.model, fullError: data \}\);\n      \n      if \(!response\.ok \|\| data\.error\) \{\n        const errorDetails = data\.provider && data\.model \n          \? `\[\$\{data\.provider\} \/ \$\{data\.model\}\] \$\{data\.message \|\| data\.error\}`\n          : \(data\.message \|\| data\.error \|\| `API error: \$\{response\.status\}`\);\n        throw new Error\(errorDetails\);\n      \}/g;

const replacement = `      let data: any = {};
      const textResponse = await response.text();
      try {
        if (textResponse) {
          data = JSON.parse(textResponse);
        }
      } catch (e) {
        console.error('🌙 Failed to parse JSON response:', textResponse);
      }
      
      console.log('🌙 Response data:', { hasText: !!data.text, hasError: !!data.error, provider: data.provider, model: data.model, fullError: data, rawText: textResponse });
      
      if (!response.ok || data.error) {
        const errorDetails = data.provider && data.model 
          ? \`[\${data.provider} / \${data.model}] \${data.message || data.error || textResponse}\`
          : (data.message || data.error || textResponse || \`API error: \${response.status}\`);
        throw new Error(errorDetails);
      }`;

code = code.replace(regex, replacement);

// Fix Supabase database fetch catch error as well:
const regex2 = /          const sessionData = await sessionRes\.json\(\);/g;
const replace2 = `          const text = await sessionRes.text();
          if (!sessionRes.ok) throw new Error(\`DB Error \${sessionRes.status}: \${text}\`);
          const sessionData = text ? JSON.parse(text) : {};`;
code = code.replace(regex2, replace2);

const regex3 = /      \/\/ SYNC TO SUPABASE AFTER RESPONSE\n      if \(isSignedIn\) \{\n        if \(!activeSessionId\) \{/g;
const replace3 = `      // SYNC TO SUPABASE AFTER RESPONSE
      if (isSignedIn) {
        try {
          if (!activeSessionId) {`;
code = code.replace(regex3, replace3);

const regex4 = /             setSessions\(prev => prev\.map\(s => s\.id === activeSessionId \? \{ \.\.\.s, updated_at: sessionData\.updated_at \} : s\)\.sort\(\(a,b\) => new Date\(b\.updated_at\)\.getTime\(\) - new Date\(a\.updated_at\)\.getTime\(\)\)\);\n          \}\n        \}\n      \}/g;
const replace4 = `             setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, updated_at: sessionData.updated_at } : s).sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
          }
        }
        } catch (dbError) {
          console.error("🌙 Luna Verde: Failed to sync session to database, but message was delivered.", dbError);
        }
      }`;
code = code.replace(regex4, replace4);

const regex5 = /      const res = await fetch\(`\/api\/sessions\/\$\{id\}`\);\n      if \(!res\.ok\) throw new Error\("Failed to load session"\);\n      const data = await res\.json\(\);/g;
const replace5 = `      const res = await fetch(\`/api/sessions/\${id}\`);
      const text = await res.text();
      if (!res.ok) throw new Error(\`Failed to load session: \${text}\`);
      const data = text ? JSON.parse(text) : {};`;
code = code.replace(regex5, replace5);

const regex6 = /        fetch\('\/api\/sessions'\)\n        \.then\(res => res\.json\(\)\)\n        \.then\(data => \{\n          if \(Array\.isArray\(data\)\) \{\n            setSessions\(data\);\n          \}\n        \}\)/g;
const replace6 = `        fetch('/api/sessions')
        .then(res => res.text().then(text => ({ ok: res.ok, status: res.status, text })))
        .then(({ ok, status, text }) => {
          if (!ok) {
            console.error(\`Failed to fetch sessions: \${status} - \${text}\`);
            return;
          }
          if (text) {
            try {
              const data = JSON.parse(text);
              if (Array.isArray(data)) {
                setSessions(data);
              }
            } catch (e) {
              console.error("Failed to parse sessions JSON", e);
            }
          }
        })
        .catch(err => console.error("Error fetching sessions:", err))`;
code = code.replace(regex6, replace6);

const regex7 = /      if \(res\.ok\) \{\n        setSessions\(prev => prev\.map\(s => s\.id === id \? \{ \.\.\.s, title: newTitle \} : s\)\);\n      \}/g;
const replace7 = `      const text = await res.text();
      if (!res.ok) throw new Error(\`Status \${res.status}: \${text}\`);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));`;
code = code.replace(regex7, replace7);

fs.writeFileSync('app/chat/page.tsx', code);
console.log('Fixed');
