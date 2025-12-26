# ⚡ Xandeum  — pNode Analytics Platform

![Xandeum Dashboard](https://image2url.com/r2/bucket2/images/1766713496885-18dbc42c-5e0f-4d49-8e8a-e0b51fc20516.jpg)

**Xandeum Pulse** is a high-performance analytics dashboard designed for monitoring the Xandeum storage layer. Developed for the Xandeum Analytics Challenge, this platform demonstrates a next-gen approach to visualizing pNode (storage provider) networks on Solana.

> **Note:** This project was built in a single 10-hour "sprint" during a break from my 90-day development marathon on my main project, **SYLVAN**.

## 🚀 Mission

To bring ultimate transparency to the Xandeum network. Inspired by tools like *stakewiz.com* and *validators.app*, **Xandeum Pulse** empowers operators and users to monitor network health, verify resource distribution, and audit node performance through a professional-grade interface.

## ✨ Key Features (Innovation & UX)

Moving beyond simple tables, Xandeum Pulse prioritizes data visualization and user experience:

* **Global Network Topology:** An interactive map displaying active and offline nodes globally.
* **Storage Wealth Distribution:** Analytical charts showing credit and storage allocation across the ecosystem.
* **pNode Explorer V2.0:** Deep-dive node auditing featuring Trust Scores, Latency, and Version tracking.
* **Cyberpunk Command Center UI:** A high-density interface reflecting the decentralized nature of the network.
* **Mobile-Responsive:** Optimized layouts for monitoring infrastructure on any device.

## 🛠 Tech Stack

* **Framework:** React 18 / Next.js (App Router)
* **Styling:** TailwindCSS & Framer Motion
* **Maps:** Leaflet.js
* **Charts:** Recharts
* **Icons:** Lucide-react

## 🔧 Technical Notes

The platform is architected for seamless pRPC integration:

1.  **UI/UX Layer:** Fully implemented to handle complex nested data structures from Xandeum's pRPC.
2.  **pRPC Integration Ready:** The service layer is structured to adopt JSON-RPC calls.
3.  **Data Modeling:** Currently utilizes structured data models identical to Xandeum Gossip/pRPC outputs to demonstrate the full UX potential.

## 🏃 Getting Started

### Prerequisites
* Node.js 18+
* npm / yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone [https://github.com/SylvanDev/xandeum-nodescan.git](https://github.com/SylvanDev/xandeum-nodescan.git)
    cd xandeum-nodescan
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Navigate to [http://localhost:3000](http://localhost:3000).

## 🎮 About the Developer

This dashboard is the result of applying systems engineering and gamedev UI principles. I am currently on Day 90 of developing my main project, **SYLVAN**. The discipline required for long-term solo gamedev allowed me to crunch and deliver this professional-grade analytics hub in just one day.

---
Built with ⚡ by [SylvanDev](https://github.com/SylvanDev)
