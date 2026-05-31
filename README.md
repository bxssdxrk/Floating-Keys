# Float Keys

Float Keys is a customizable, floating keyboard overlay for any webpage. It provides essential key controls directly within your browser, allowing you to create custom layouts, define key combinations, and interact with web pages more efficiently.

## Features

*   **Floating Overlay:** Drag and reposition the keyboard anywhere on the webpage.
*   **Custom Layouts:** Create and save multiple keyboard layouts using the built-in editor.
*   **Fully Customizable:**
    *   Set custom key mapping.
    *   Define key combinations (e.g., Ctrl+C, Ctrl+Shift+C).
    *   Adjust cell sizes (row and column spans).
    *   Define button display labels.
*   **Split Mode:** Toggle between a compact widget and split-key mode.
*   **Responsive:** Resize the widget interactively by dragging the bottom-right corner.
*   **Persistent:** Saves your layout configurations and settings using browser storage.

## Installation

1.  Clone this repository or download the source code.
2.  Open Chrome/Edge/Brave and navigate to `chrome://extensions/` (or `edge://extensions/`).
3.  Enable **Developer mode** (usually a toggle in the top right).
4.  Click **Load unpacked**.
5.  Select the folder containing the project files.

## Usage

*   **Opening the Control Panel:** Click the Float Keys icon in your browser toolbar to open the settings popup.
*   **Settings Tab:** Toggle the visibility of the widget and the resize handle.
*   **Layouts Tab:** Select between your saved layouts or reset to the default configuration.
*   **Editor Tab:**
    *   Configure grid dimensions (rows and columns).
    *   Apply changes to preview.
    *   Click on any cell to open the **Key Configuration Modal** to assign a key, define combinations, or customize button labels.
    *   Save your custom layouts to access them later in the Layouts tab.

## Development

*   `content.js`: Handles the floating UI rendering, interaction, key dispatching logic, and state management within the webpage.
*   `popup.js`: Manages the configuration interface, layout editor, and storage interactions.
*   `content.css`: Styles for the floating widget, control bar, and interactive buttons.
*   `popup.html`: The UI structure for the extension popup.

---
*Built as a browser extension for productivity and accessibility.*
