import json, os

path = os.path.expanduser('~/Desktop/house-ai/vercel.json')

config = {
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

with open(path, 'w') as f:
    json.dump(config, f, indent=2)

print('✅ vercel.json 更新完了！')
