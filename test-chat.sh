#!/bin/bash
curl -X POST https://blxckchat-j372aorqa-jexxxus.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello Luna, who are you?"}],
    "mode": "venus",
    "model": "gpt-4o",
    "type": "text"
  }' \
  -v 2>&1 | head -100
