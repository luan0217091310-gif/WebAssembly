# WebAssembly (Wasm) for High Performance - Image Processing Demo

This repository contains the implementation for **Topic 7: WebAssembly (Wasm) for High Performance**. It bridges C++ with JS using the browser execution sandbox to offload heavy computation.

## Project Structure (MVC Architecture)

The project perfectly balances modern Client-Side processing (WASM/JS) and a Server-Side MVC architecture (PHP/MySQL) to fit the required technical stack while demonstrating the power of WebAssembly.

```
/
├── app/
│   ├── controllers/
│   │   ├── HomeController.php
│   │   └── LogController.php
│   ├── models/
│   │   ├── Database.php
│   │   └── LogModel.php
│   └── views/
│       └── home/
│           └── index.php      # Main Application UI
├── public/
│   ├── css/
│   │   └── style.css          # Modern UI/UX Glassmorphism styles
│   ├── js/
│   │   └── app.js             # Client logic handling Wasm/JS comparisons
│   ├── wasm/
│   │   ├── image_processing.cpp # C++ source representing the Wasm module
│   │   ├── image_processing.wat # Wasm Text representation
│   │   └── image_processing.wasm# Compiled WebAssembly binary
│   ├── .htaccess              # Apache routing
│   └── index.php              # Application Entry Point
├── architecture.puml          # UML diagram for System Architecture
├── database.sql               # Database setup script
└── README.md
```

## System Architecture

The architecture relies on a **Client-heavy processing model with Server-side tracking**.

- **Frontend**: Handles user image uploads and renders to the `<canvas>`. Extracts raw pixel data (`Uint8Array`) and processes it either via Pure JavaScript loops or by passing the ArrayBuffer into the **WebAssembly linear memory** for near-native C++ processing speed.
- **Backend (MVC)**: A robust PHP MVC backend exposes RESTful endpoints (via `LogController`) to record the execution time (`ms`) of WASM vs JS runs into a MySQL database via PDO.

## Step-by-Step Setup Instructions

1. **Environment Requirements**:

   - Web Server: XAMPP / WAMP / Apache
   - PHP: ^7.4 or ^8.x
   - MySQL: ^5.7 or ^8.x
2. **Database Setup**:

   - Open phpMyAdmin or your MySQL client.
   - Run the provided `database.sql` script to create the `wasm_demo` database and `performance_logs` table.
3. **Configure Database Credentials**:

   - Open `app/models/Database.php`.
   - The default configuration uses `localhost`, root user, and no password. Update these if your environment differs:
     ```php
     private $host = "localhost";
     private $db_name = "webassembly";
     private $username = "root";   // Update me
     private $password = "";       // Update me
     ```
4. **Web Server Setup**:

   - Place this entire repository folder inside your web server's document root (e.g., `htdocs` or `www`).
   - For Apache, ensure `mod_rewrite` is enabled.
   - Point your virtual host to the root directory, OR access it via `http://localhost/your-folder-name/public/`.

## Testing the Application

1. Open the application in a modern browser (Chrome, Edge, Firefox).
2. Click **Upload Image** and select any high-resolution image.
3. Choose a filter (Invert or Grayscale).
4. Click **Run Pure JS** and observe the execution time.
5. Click **Run WebAssembly** and observe the execution time.
6. The performance log on the side will dynamically update via the MVC backend.

## WebAssembly Compilation Note

The `image_processing.wasm` file is pre-compiled. In a standard C++ pipeline, this is done using Emscripten (`emcc`). The equivalent C++ logic and WebAssembly Text (`.wat`) are provided in `public/wasm/` for academic demonstration purposes.
