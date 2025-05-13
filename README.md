# 💸 Starling Bank - Round-Up Savings App

This is my submission for the Starling Bank Frontend Engineer Technical Challenge.

The app connects to the **Starling Sandbox API**, fetches recent transaction data, calculates round-up savings from outgoing transactions, and transfers the total to a dedicated savings goal ("Round-up Saver").

---

## 📦 Tech Stack

- React + TypeScript
- Axios (for HTTP requests)
- Vite (for fast development and build tooling)
- CSS Modules and plain CSS for styling
- @testing-library/react (for UI testing)

---

## 🚀 Features

- ✅ Fetches account and transaction data from the Starling API
- ✅ Calculates round-up amount for each transaction
- ✅ Sums the total round-up for the past 7 days
- ✅ Creates a savings goal ("Round-up Saver") if one doesn’t exist
- ✅ Transfers the round-up amount to the savings goal
- ✅ Displays status updates for each step
- ✅ Fully typed using TypeScript
- ✅ Handles API errors gracefully
- ✅ Automated testing with Vitest and GitHub Actions
- ✅ Test coverage reporting

---

## 🔧 Setup Instructions

- git clone [git@github.com:wazzywael/starling-roundup.git](https://github.com/wazzywael/starling-roundup)
- cd starling-roundup-app
- npm install
- npm run dev

## 🧪 Running Tests

- npm test

## 👤 Author

**Wael Kanbar**  
[GitHub Profile](https://github.com/wazzywael)