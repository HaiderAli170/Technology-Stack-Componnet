<div align="center">

# 🚀 Technology Stack Component

**A reusable Technology Stack component built with Next.js, Tailwind CSS, Sera UI, and GSAP.**  
_Easily showcase the technologies your project uses in a clean, animated, and responsive design._

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=nextdotjs)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-blue?logo=tailwindcss)
![Sera UI](https://img.shields.io/badge/Sera%20UI-purple?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyOCIgY3k9IjI4IiByPSIyOCIgZmlsbD0iI0YwRGYwRCIvPjwvc3ZnPg==)
![GSAP](https://img.shields.io/badge/GSAP-Animation-5fd400?logo=greensock)
![Responsive](https://img.shields.io/badge/Responsive-Yes-green)
![VS Code](https://img.shields.io/badge/VSCode-Recommended-blue?logo=visualstudiocode)

</div>

---

## 📦 Features

- ⚡ **Next.js 14+**
- 🎨 **Tailwind CSS styling**
- 🧩 **Sera UI components**
- 🎞️ **Smooth GSAP animations**
- 📱 **Fully responsive & customizable**
- 💻 **Works seamlessly in Visual Studio Code**

---

## 🛠️ Installation

1. **Clone Repository**
    ```bash
    git clone https://github.com/your-username/technology-stack.git
    cd technology-stack
    ```

2. **Install Dependencies**

    Make sure you have Node.js (>=18) installed.
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. **Install Tailwind CSS**

    If your project doesn’t already have Tailwind set up:
    ```bash
    npx tailwindcss init -p
    ```

    Update your `tailwind.config.js`:
    ```js
    module.exports = {
      content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@seraui/components/**/*.{js,ts,jsx,tsx}"
      ],
      theme: { extend: {} },
      plugins: [],
    };
    ```
    👉 Alternatively, follow [Sera UI installation guide](https://seraui.com/docs/installation).

4. **Install Sera UI**
    ```bash
    npm install @seraui/components
    # or
    yarn add @seraui/components
    ```

5. **Install GSAP (Required for Animations)**
    ```bash
    npm install gsap
    # or
    yarn add gsap
    ```

---

## ⚙️ Usage

Import and use the `TechnologyStack` component in your Next.js project:

```js
import { TechnologyStack } from "@/components/TechnologyStack";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <TechnologyStack/>
    </main>
  );
}
```

---

## 👨‍💻 Development (VS Code Recommended)

- **Open in Visual Studio Code**
- **Install extensions:**
    - Tailwind CSS IntelliSense
    - Prettier (Code Formatter)
- **Run dev server:**
    ```bash
    npm run dev
    ```
- Visit [http://localhost:3000](http://localhost:3000) to view the component.

---

## 📸 Preview

<div align="center">
  <img width="944" height="452" alt="Technology Stack Preview" src="https://github.com/user-attachments/assets/3049a749-26fc-4674-a588-5a02e5985fcb" />
</div>

---

## 📝 Contribution

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you’d like to change.

---

## 👤 Author

**Haider Ali**
