# Earthquake Cebu - Real-time Updates

A full-stack web application for showcasing real-time updates, news, and visual documentation of earthquake events in Cebu, Philippines.

## 🚀 Features

- **Real-time Updates**: Latest news and developments about earthquake situations
- **Interactive Map**: Google Maps integration showing affected areas with markers
- **Image Gallery**: Visual documentation with jsDelivr CDN integration
- **Admin Panel**: Secure management of updates and map markers
- **Mobile-friendly**: Responsive design for all devices
- **Fast Loading**: Optimized for quick access to critical information

## 🛠️ Tech Stack

- **Frontend**: React 18 with React Router
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Maps**: Google Maps JavaScript API
- **Images**: GitHub repository served via jsDelivr CDN
- **Authentication**: JWT tokens

## 📁 Project Structure

```
earthquake-cebu/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   └── package.json
├── database/               # Database schema
│   └── schema.sql
├── package.json           # Root package.json
├── env.example            # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd earthquake-cebu
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=earthquake_cebu
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_here
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   GITHUB_REPO=username/earthquake-images
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Set up the database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start both the React frontend (port 3000) and Express backend (port 5000).

## 🔧 Configuration

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Maps JavaScript API
3. Create an API key
4. Add the key to your `.env` file

### Image Hosting with jsDelivr

1. Create a public GitHub repository for your images
2. Upload images to the repository
3. Use jsDelivr URLs in the format:
   ```
   https://cdn.jsdelivr.net/gh/username/repository@main/path/to/image.jpg
   ```
4. Update the `GITHUB_REPO` in your `.env` file

### Database Configuration

The application uses the following tables:

- **markers**: Map points with coordinates and descriptions
- **updates**: News and updates
- **admin**: Admin user authentication
- **donations**: Donation information

## 📱 API Endpoints

### Public Endpoints
- `GET /api/markers` - Get all map markers
- `GET /api/updates` - Get all updates
- `GET /api/donations` - Get donation information

### Admin Endpoints (Authentication Required)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/update` - Add new update
- `POST /api/admin/marker` - Add new marker
- `PUT /api/admin/update/:id` - Edit update
- `PUT /api/admin/marker/:id` - Edit marker
- `DELETE /api/admin/update/:id` - Delete update
- `DELETE /api/admin/marker/:id` - Delete marker

## 🚀 Deployment

### Production Build

1. **Build the React app**
   ```bash
   cd client
   npm run build
   ```

2. **Start the production server**
   ```bash
   cd server
   npm start
   ```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=earthquake_cebu
PORT=5000
JWT_SECRET=your_secure_jwt_secret
GOOGLE_MAPS_API_KEY=your_production_maps_api_key
GITHUB_REPO=username/earthquake-images
```


## 🔐 Security Features

- JWT-based authentication for admin access
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Updates

The application is designed for frequent updates and real-time information sharing. The admin panel allows for quick posting of new updates and map markers to keep the public informed.

---

**Note**: This application is specifically designed for earthquake updates in Cebu, Philippines, but can be adapted for other emergency situations or locations.