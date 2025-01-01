

# Unoffical Kobo Composite Markup Generator Tool

![Project Banner](path-to-your-banner-image) <!-- Optional: Add a banner image if available -->

## Table of Contents

- [Overview](#overview)
- [Background](#background)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Author](#author)
- [Project Repository](#project-repository)
- [Disclaimer](#disclaimer)
- [License](#license) <!-- Optional: Add if you have a license -->

## Overview

The **Unoffical Kobo Composite Markup Generator** is a user-friendly web tool designed to process Kobo e-reader data efficiently. It allows users to overlay SVG images onto JPG files and generate composite PNG images based on data extracted from a `KoboReader.sqlite` database. By leveraging modern web technologies, this tool provides an accessible solution without the need for complex technical configurations, making it easily usable by a broader audience.

## Background

Kobo, the company behind popular e-readers like the Kobo Libra 2, has not provided a native solution for exporting markups outside of their proprietary ecosystem. This limitation has been a point of frustration for many Kobo users, including myself. To address this gap, I developed the **Chrome Composite Markup Generator**.

The initial iteration of this project was a Python script that required intricate environment setups and technical configurations, making it inaccessible to most users. Recognizing the need for a more accessible solution, I completely rewrote the tool using JavaScript and HTML. This transition ensures that users can effortlessly run the tool directly from their Chrome browser without worrying about environment configurations.

The tool has been thoroughly tested in December 2024 on both **Linux** and **Windows** operating systems using the **Google Chrome** browser, specifically with the Kobo Libra 2 device, ensuring reliable performance across these platforms.

## Features

- **SQLite Database Integration**: Reads and extracts relevant data from the `KoboReader.sqlite` file.
- **Image Processing**: Overlays SVG images onto JPG files to create composite PNG images.
- **User-Friendly Interface**: Simple and intuitive web-based interface for easy navigation and usage.
- **Progress Tracking**: Real-time progress bar and logging to monitor processing status.
- **No Modification of Original Files**: Ensures that original `KoboReader.sqlite`, `.jpg`, and `.svg` files remain unaltered.
- **Author and Repository Information**: Easily accessible links to the author's GitHub profile and project repository.

## Installation

Follow these steps to set up and use the **Chrome Composite Markup Generator**:

1. **Download the Project**:
   
   - Navigate to the [Chrome Composite Markup Generator Repository](https://github.com/leldr/Chrome-Composite-Markup-Generator) on GitHub.
   - Click on the green **Code** button and select **Download ZIP**.
   
   ![Download ZIP](path-to-download-zip-image) <!-- Optional: Add an image showing the download button -->

2. **Extract the ZIP File**:
   
   - Locate the downloaded ZIP file on your computer.
   - Right-click the file and select **Extract All...**.
   - Choose a destination folder where you want to store the project files and click **Extract**.

3. **Run the Tool**:
   
   - Open the extracted folder.
   - Locate the `index.html` file.
   - Open `index.html` in the **Google Chrome** browser to use the tool.

   **Note**: This tool is specifically designed to be used in the Google Chrome browser due to its reliance on the File System Access API, which is supported in Chromium-based browsers like Chrome and Edge.

## Usage

1. **Open the Tool**:
   
   - Launch **Google Chrome**.
   - Open the `index.html` file either by dragging it into the browser window or by using the **File > Open File** option in Chrome.

2. **Follow On-Screen Instructions**:
   
   - The tool provides step-by-step instructions within the interface. Please follow these instructions carefully to ensure optimal performance and intended results.

   ![Tool Interface](path-to-tool-interface-image) <!-- Optional: Add a screenshot of the tool interface -->

3. **Processing Files**:
   
   - **Select KoboReader.sqlite File**: Click on the file input labeled "Select KoboReader.sqlite File" and choose the appropriate SQLite database file from your system.
   - **Select Input Directory**: Click on the file input labeled "Select Input Directory (.kobo/markups)" and navigate to the directory containing your `.jpg` and `.svg` files.
   - **Create a New Output Directory**: 
     - **Crucial Step**: It is **crucial** to create a **new** directory that will serve as the output directory. Not doing so can negatively impact the performance of the tool.
     - **How to Create**:
       - Choose a location on your system where you want the output files to be saved.
       - Create a new folder (e.g., "CompositeOutputs") to ensure that existing files are not overwritten and to maintain optimal performance.
   - **Select Output Directory**: Click the "Select Output Directory" button and navigate to the newly created directory. Select it to set it as the destination for the processed files.
   - **Run Composite**: Once all the above steps are completed and the "Run Composite" button is enabled, click it to start the processing of your files. Monitor the progress and logs to ensure everything runs smoothly.

## Author

Developed by [@leldr](https://github.com/leldr) on GitHub.

![Author GitHub](https://img.shields.io/badge/GitHub-%40leldr-blue?style=for-the-badge&logo=github)

## Project Repository

Access the project's source code and contribute to its development:

🔗 [Chrome-Composite-Markup-Generator](https://github.com/leldr/Chrome-Composite-Markup-Generator)

![Repository Stars](https://img.shields.io/github/stars/leldr/Chrome-Composite-Markup-Generator?style=for-the-badge)
![Repository Forks](https://img.shields.io/github/forks/leldr/Chrome-Composite-Markup-Generator?style=for-the-badge)

## Disclaimer

**Important:** This tool is provided **as is**, without any warranties or guarantees of any kind. The developer is not liable for any damages, losses, or issues that may arise from the use or inability to use this tool. 

**Note:** This tool does **not** modify your original `KoboReader.sqlite` file or the input `.jpg` and `.svg` files. However, users are advised to use this application responsibly and ensure that their data is backed up before proceeding.

![Disclaimer](path-to-disclaimer-image) <!-- Optional: Add an image related to disclaimer -->

## License

<!-- Optional: Add license information if applicable -->

This project is licensed under the [MIT License](LICENSE).

---

### Additional Notes

- **Browser Compatibility**: Ensure you're using a **Chromium-based browser** like **Google Chrome** or **Microsoft Edge** for the best experience, as the tool relies on the **File System Access API**, which is supported in these browsers.

- **Data Safety**: While the tool is designed not to modify your original files, it's a good practice to back up your `KoboReader.sqlite`, `.jpg`, and `.svg` files before processing.

- **Contributing**: Contributions are welcome! Feel free to fork the repository and submit pull requests for enhancements or bug fixes.

- **Support**: If you encounter any issues or have questions, please open an [issue](https://github.com/leldr/Chrome-Composite-Markup-Generator/issues) on the GitHub repository.

