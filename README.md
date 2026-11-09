# 🍲 Dhillon Dhaba — Mobile Food Delivery App

A high-performance React Native (Expo SDK 58 + TypeScript) mobile application for **Dhillon Dhaba** food delivery.

Designed to pair seamlessly with the ASP.NET Core 8 Web API backend (`DhillonDhabaWebApp`), with dual-mode support (Live Backend API + built-in Offline Mock Demo mode).

---

## 📱 Features

- **Punjabi Dhaba Branding & Theme**: Warm saffron/amber tandoori palette (`#E65100`), desi makhan cream accents, FSSAI-standard Veg / Non-Veg indicators, and spicy meter badges (`🌶️ Mild`, `🌶️🌶️ Medium`, `🌶️🌶️🌶️ Spicy`).
- **Authentic Dhaba Menu**:
  - Tandoori Starters (Amritsari Paneer Tikka, Murgh Tikka, Malai Chaap)
  - 24-hr Handi Curries (Slow-cooked Dal Makhani, Highway Butter Chicken)
  - Clay Tandoor Breads (Amritsari Chur Chur Naan, Garlic Butter Naan)
  - Dum Biryanis & Jeera Rice
  - Amritsari Patiala Meethi Lassi in earthen kulhad & Hot Gulab Jamun with Rabri
- **Item Customizer Modal**:
  - Portion size selection (Half / Full)
  - Addon groups with min/max selection validation (White butter, mint chutney, sirka onions)
  - Special cooking instructions note input
- **Cart & Coupons**:
  - Live quantity modification (`- 1 +`), item notes, and addon breakdown
  - Promo coupon support (`WELCOME50`, `MAKHAN100`, `FREEDELIVERY`)
  - Item total, packaging charges, GST (5%), delivery fees (free above ₹499)
- **Checkout & Address Book**:
  - Delivery vs Takeaway switch
  - Saved addresses manager (Home, Work, Other)
  - Payment method selection: Cash on Delivery (COD) or Online (UPI, Cards, NetBanking)
- **Live Order Tracking**:
  - Visual step progress: `Placed` ➔ `Confirmed` ➔ `In Tandoor` ➔ `On The Way` ➔ `Delivered`
  - Estimated delivery countdown timer
  - Kitchen contact phone call prompt
  - Itemized digital receipt
- **Reviews & Ratings**:
  - 5-star rating for overall experience, food freshness, and delivery speed
- **Dual-Mode System**:
  - **Demo Mode**: Run the app immediately without starting MySQL or backend.
  - **Live Mode**: Connect to local ASP.NET Core Web API with automatic JWT token refresh rotation (`/v1/auth/refresh`).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd c:\WebDhabaAppBackend\DhillonDhabaMobile
npm install
```

### 2. Start the App
```bash
npm start
```
This opens the Expo interactive terminal with a QR code.

### 3. Run on Devices

- **Physical Phone (iOS / Android)**:
  1. Install **Expo Go** from Google Play Store or Apple App Store.
  2. Make sure your phone and laptop are on the same Wi-Fi network.
  3. Scan the QR code shown in the terminal.

- **Android Emulator**:
  ```bash
  npm run android
  ```

- **Web Preview**:
  ```bash
  npm run web
  ```

---

## ⚙️ Connecting to Live Backend API

1. In the mobile app, go to **Profile ➔ Developer Tools**.
2. Toggle off **Mock Demo Mode**.
3. Tap **Backend API URL**:
   - If using **Android Emulator**: `http://10.0.2.2:5088` (or port configured in backend `launchSettings.json`).
   - If using **Physical Phone via Wi-Fi**: enter your PC's local IP, e.g. `http://192.168.1.5:5088`.
4. The app will communicate directly with your ASP.NET Core endpoints (`/v1/auth`, `/v1/outlets`, `/v1/cart`, `/v1/orders`, `/v1/me`).

