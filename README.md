mkdir ecomm
echo README.md
documentation
file structure monorepo
apps
packages

create nextjs app manualy
install
pnpm i next@latest react@latest react-dom@latest
add 
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
add page and layout
add typescript for dev
add ts.config using pnpm exec tsc --init
pnpm i -D @types/react
"verbatimModuleSyntax": false, to false
change module nodenext for esnext
remove rootDir

