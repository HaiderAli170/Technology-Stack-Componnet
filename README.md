Technology Stack Component

A reusable Technology Stack component built with Next.js
, Tailwind CSS
, and Sera UI
.
Easily showcase the technologies your project uses in a clean, responsive design.

📦 Features

⚡ Built with Next.js 14+

🎨 Styled using Tailwind CSS

🧩 Powered by Sera UI components

📱 Fully responsive and customizable

💻 Works seamlessly in Visual Studio Code

🛠️ Installation
1. Clone Repository
git clone https://github.com/your-username/technology-stack.git
cd technology-stack

2. Install Dependencies

Make sure you have Node.js (>=18) installed.

npm install
# or
yarn install
# or
pnpm install

3. Install Tailwind CSS

If your project doesn’t already have Tailwind set up:

npx tailwindcss init -p


Update your tailwind.config.js:

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@seraui/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

or Go to Sera Ui and Install 

4. Install Sera UI
npm install @seraui/components
# or
yarn add @seraui/components

⚙️ Usage

Import and use the TechnologyStack component in your Next.js project:

import { TechnologyStack } from "@/components/TechnologyStack";

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen">
      <TechnologyStack />
    </main>
  );
}

👨‍💻 Development (VS Code Recommended)

Open in Visual Studio Code

Install extensions:

Tailwind CSS IntelliSense

Prettier (Code Formatter)

Run dev server:

npm run dev


Visit http://localhost:3000
 to view the component.

📸 Preview (Optional)

<img width="944" height="452" alt="image" src="https://github.com/user-attachments/assets/3049a749-26fc-4674-a588-5a02e5985fcb" />


📝 Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you’d like to change.

Haider Ali
