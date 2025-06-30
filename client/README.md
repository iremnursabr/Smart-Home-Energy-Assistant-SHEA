# Smart Energy Assistant - Frontend

This is the frontend application for the Smart Energy Assistant project. It provides a user interface for managing energy consumption, devices, invoices, and energy-saving suggestions.

## Features

- User authentication (login, registration)
- Dashboard with energy consumption overview
- Device management
- Energy consumption tracking and visualization
- Invoice management
- Energy-saving suggestions
- User profile and settings
- Multilingual support (English, Turkish, German, French, Spanish)
- Light and dark theme

## Technologies Used

- React 18
- TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Material UI for components
- Chart.js for data visualization
- i18next for internationalization
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
npm start
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
npm run build
```

This will create a `build` directory with optimized production files.

## Project Structure

- `src/components`: Reusable UI components
- `src/layouts`: Page layout components
- `src/pages`: Application pages
- `src/store`: Redux store and slices
- `src/theme`: Theme configuration
- `src/i18n`: Internationalization setup and translations
- `src/utils`: Utility functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
