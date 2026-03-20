# Node Version Manager
1. To run the project under Windows, it needs to be installed NVM - Node Version Manager
2. Project Node version - 14.16.1

# Changes in package.json
1. In "dependencies" remove node-sass (it is very old and not used anymore) & typescript (we need to use an older version)
2. Replace "devDependencies" with: 
```
  "devDependencies": {
    "@types/react-google-recaptcha": "^2.1.5",
    "@typescript-eslint/eslint-plugin": "^5.6.0",
    "@typescript-eslint/parser": "^5.6.0",
    "ajv": "^8.17.1",
    "eslint": "^7.32.0",
    "sass": "^1.79.4",
    "typescript": "^3.7.5"
  }
```