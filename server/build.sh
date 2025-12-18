#!/bin/sh
echo "⚠️  No src/ directory found"
echo "Creating minimal React app..."

# Créer une structure minimale
mkdir -p src
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

cat > src/App.jsx << 'EOF'
import React from 'react'

function App() {
  return (
    <div>
      <h1>DemoExpert</h1>
      <p>Application is building...</p>
    </div>
  )
}

export default App
EOF

# Installer et builder
npm install
npm run build
