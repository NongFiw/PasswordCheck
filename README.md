# 🔐 Passchk — Password Strength Checker

A client-side password strength checker that evaluates your password using **entropy-based analysis**, **letter-pair frequency tables**, and a **common password dictionary** — all running entirely in your browser with **zero data sent to any server**.

> Originally based on the password checker from [rumkin.com](http://rumkin.com/tools/password/passchk.php), with significant enhancements including a modern UI, crack-time estimation, breach checking, and actionable suggestions.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Entropy Calculation** | Computes password strength in bits using charset size and English letter-pair frequency analysis |
| **Strength Meter** | Visual progress bar with color coding (red → orange → yellow → green → blue) |
| **Common Password Detection** | Checks against a compressed dictionary of thousands of commonly used passwords |
| **Crack Time Estimation** | Shows estimated time-to-crack across 5 attack scenarios (online → supercomputer) |
| **Strength Breakdown** | Detailed analysis with actionable "Apply" buttons to instantly improve your password |
| **Password Generator** | Generates strong 25-character passwords that pass all quality checks |
| **Show/Hide Toggle** | Safely reveal your password with an overlay preview |
| **Copy to Clipboard** | One-click copy via Clipboard API or fallback |
| **Have I Been Pwned** | Check if your password appears in known data breaches (via k-Anonymity — your full password is never sent) |
| **Fully Offline** | All analysis runs 100% client-side — no backend, no tracking, no network requests (except optional HIBP check) |

---

## 🖥️ Demo

Simply open `passchk.html` in any modern browser — no server or build step required.

```
passchk.html
```

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Edge, Safari, etc.)

### Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/passchk.git
   cd passchk
   ```

2. **Open in browser**
   ```bash
   # Simply open the HTML file directly
   open passchk.html        # macOS
   start passchk.html       # Windows
   xdg-open passchk.html    # Linux
   ```

3. **Start typing** a password to see real-time analysis, or click **Generate** for a strong random password.

---

## 🔍 How It Works

### Entropy Score

The strength score is calculated based on:

1. **Charset Size** — determined by which character classes appear in the password (lowercase, uppercase, digits, symbols, spaces, extended characters)
2. **Letter-pair Frequency** — uses a pre-computed English bigram frequency table to penalize predictable letter combinations (e.g., "th", "er", "qu" get penalized more than random pairs)
3. **Squared Penalty** — assumes an intelligent attacker who guesses common pairs first

```
bits += charsetBits × (1 − frequency[pair])²
```

### Strength Levels

| Entropy (bits) | Rating | Color |
|---|---|---|
| < 28 | Very Weak | 🔴 Red |
| 28 – 35 | Weak | 🟠 Orange |
| 36 – 59 | Reasonable | 🟡 Yellow |
| 60 – 127 | Strong | 🟢 Green |
| ≥ 128 | Very Strong | 🔵 Blue |

### Crack Time Scenarios

| Scenario | Guesses/sec |
|---|---|
| Online attacker (limited) | 1,000 |
| Fast online / botnet | 1,000,000 |
| Single GPU (offline) | 1,000,000,000 |
| Cluster / small ASIC farm | 1,000,000,000,000 |
| Large supercomputer/ASIC farm | 1,000,000,000,000,000 |

### Have I Been Pwned (HIBP) Integration

Uses the [k-Anonymity model](https://haveibeenpwned.com/API/v3#PwnedPasswords):
- Only the first 5 characters of the SHA-1 hash are sent to the HIBP API
- Your actual password **never leaves your browser**
- The response is checked locally for a matching suffix

---

## 📁 Project Structure

```
passchk-master/
├── passchk.html    # Main HTML page (public domain)
├── passchk.js      # Core logic: strength analysis, UI helpers, HIBP check
├── common.js       # Compressed dictionary of common passwords
├── frequency.js    # Encoded English letter-pair frequency table
├── style.css       # Minimal responsive styling
├── COPYING         # GNU GPLv3 license text
└── README.md       # This file
```

---

## 🔒 Privacy & Security

- **No server-side processing** — everything runs in your browser
- **No data collection** — no analytics, no cookies, no tracking
- **No dependencies** — zero external JS libraries; vanilla JavaScript only
- **HIBP check is optional** — and uses k-Anonymity so your password hash is never fully transmitted

---

## 🛠️ Customization

### Adjusting Password Length

The built-in generator creates 25-character passwords by default. To change:

```javascript
// In passchk.js, call with a custom length
generatePassword(16);  // 16-character password
```

### Embedding in Your Site

Include the three JS files and add the form HTML to your page:

```html
<script src="passchk.js"></script>
<script src="common.js"></script>
<script src="frequency.js"></script>
```

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** (GPLv3).

- The JavaScript source files (`passchk.js`, `common.js`, `frequency.js`) are GPLv3
- The HTML file (`passchk.html`) is **public domain**
- See [COPYING](COPYING) for the full license text

Original source: [rumkin.com/tools/password/passchk.php](http://rumkin.com/tools/password/passchk.php)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgements

- Original password checker by [Tyler Akins (Rumkin.com)](http://rumkin.com/)
- Breach database by [Have I Been Pwned](https://haveibeenpwned.com/) by Troy Hunt
