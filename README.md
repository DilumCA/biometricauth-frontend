# Biometric Authentication Frontend

A modern React frontend for biometric authentication using WebAuthn/FIDO2 standards. Built with React, Vite, and Tailwind CSS.

## Features

- 🔐 Traditional username/password authentication
- 👆 Biometric authentication (fingerprint, face recognition)
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🔔 Real-time notifications
- 📊 User dashboard with security management
- ⚡ Fast development with Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A running backend server (see backend setup)

### Installation

1. Clone the repository
```bash
git clone [your-repo-url]
cd biometric-authentication-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Backend Setup

Make sure your backend server is running on `http://localhost:5000` with the following endpoints:

- `POST /auth/signup` - User registration
- `POST /auth/login` - Traditional login
- `POST /auth/webauthn/register/begin` - Start biometric setup
- `POST /auth/webauthn/register/finish` - Complete biometric setup
- `POST /auth/webauthn/authenticate/begin` - Start biometric login
- `POST /auth/webauthn/authenticate/finish` - Complete biometric login
- `GET /auth/user/:username` - Get user information

## Usage

### Traditional Authentication

1. **Sign Up**: Create a new account with firstname, lastname, username, and password
2. **Login**: Use your username and password to log in

### Biometric Authentication

1. **Setup**: After logging in traditionally, click "Enable Biometric Authentication" in the dashboard
2. **Login**: On the login page, enter your username and click "Login with Biometric"

### Browser Compatibility

Biometric authentication requires:
- HTTPS (in production)
- Modern browsers that support WebAuthn:
  - Chrome 67+
  - Firefox 60+
  - Safari 14+
  - Edge 18+

## Security Features

- 🔒 WebAuthn/FIDO2 compliance
- 🛡️ Platform authenticator support (built-in biometrics)
- 🔐 Secure credential storage
- ✅ Origin validation
- 🎯 Challenge-response authentication

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **WebAuthn API** - Biometric authentication

## Project Structure

```
src/
├── components/
│   ├── AuthForm.jsx          # Main authentication form
│   ├── Dashboard.jsx         # User dashboard
│   ├── Notification.jsx      # Notification system
│   └── LoadingSpinner.jsx    # Loading components
├── App.jsx                   # Main app component
├── index.css                 # Global styles
└── main.jsx                  # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development

### Adding New Features

1. Create new components in the `src/components/` directory
2. Import and use in `App.jsx` or other components
3. Add styling with Tailwind CSS classes
4. Test with the development server

### Customization

- **Colors**: Modify Tailwind classes in components
- **Layout**: Adjust component structure and responsive classes
- **API Endpoints**: Update the `API_BASE` constant in components

## Troubleshooting

### Common Issues

1. **Biometric authentication not working**
   - Ensure HTTPS in production
   - Check browser compatibility
   - Verify backend endpoints are accessible

2. **CORS errors**
   - Ensure backend CORS is configured for `http://localhost:5173`
   - Check network connectivity

3. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check Node.js version compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
